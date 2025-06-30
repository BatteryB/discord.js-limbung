// TODO

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Events, GatewayIntentBits } from 'discord.js';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 다른 파일 export
import { giftQuery, drawQuery } from './components/createQuery.js';
import * as cb from './components/componentsBuilder.js';
import { drawResult, safeUpdate, safeEditReply } from './components/utils.js';

dotenv.config({ path: 'env/token.env' });
const db = new Database(path.join(path.dirname(fileURLToPath(import.meta.url)), 'db', 'limbung.db'));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
        if (interaction.commandName == '에고기프트') {
            await interaction.deferReply();

            const options = {
                "tire": interaction.options.getNumber('티어'),
                "keyword": interaction.options.getNumber('키워드'),
                "name": interaction.options.getString('이름'),
                "material": interaction.options.getString('재료'),
                "type": interaction.options.getString('타입'),
            }

            const { query, queryParams } = giftQuery(options);

            const giftResult = db.prepare(query).all(...queryParams);

            if (giftResult.length <= 0) {
                await safeEditReply(interaction, { content: "__***검색결과를 찾지 못했습니다.. ㅠㅠ***__" })
                return;
            }

            // 결과값 3개씩 나눠서 2차원배열로 정리
            let giftList = [], giftIndex = 0;
            for (let i = 0; i < giftResult.length; i += 3) {
                const arr = giftResult.slice(i, i + 3);
                giftList.push(arr);
            }

            const embed = cb.giftEmbedBuilder(giftList[giftIndex]);
            embed.setFooter({
                text: `${giftIndex + 1} / ${giftList.length}`
            });

            const response = await safeEditReply(interaction, { embeds: [embed], components: [cb.pageButtonBuilder(false)] })

            const collector = response.createMessageComponentCollector({
                time: 300_000 // 5분
            });

            let selectGift;
            collector.on('collect', async i => {
                // i.customId가 baxk, next중에 포함 여부
                if (['back', 'next'].includes(i.customId)) {

                    if (i.customId == 'back' && giftIndex > 0) {
                        giftIndex--;
                    }
                    if (i.customId == 'next' && giftIndex < giftList.length - 1) {
                        giftIndex++;
                    }

                    const embed = cb.giftEmbedBuilder(giftList[giftIndex]);
                    embed.setFooter({
                        text: `${giftIndex + 1} / ${giftList.length}`
                    });

                    await safeUpdate(i, { embeds: [embed] })

                } else if (['effect1', 'effect2', 'effect3'].includes(i.customId)) {
                    // replace로 effect제거 후 뒤에 숫자만 남김, 이후 effect(숫자) 조합으로 바로 값 찾기
                    const effectKey = i.customId.replace('effect', '');
                    const effect = selectGift[`effect${effectKey}`];

                    await safeUpdate(i, { embeds: [cb.giftInfoEmbedBuilder(selectGift, effect)] })
                } else {
                    // giftlist에 현재 index의 선택한 위치 (2차원배열)
                    selectGift = giftList[giftIndex][Number(i.customId)];
                    if (!selectGift) {
                        await i.deferUpdate();
                        return;
                    }

                    const row = cb.effectButtonBuilder(selectGift);
                    const options = { embeds: [cb.giftInfoEmbedBuilder(selectGift, selectGift.effect1)] };
                    if (row) {
                        options.components = [row];
                    } else {
                        options.components = [];
                    }
                    await safeUpdate(i, options)
                }
            })

            collector.on('end', async () => {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('end')
                            .setLabel('검색종료')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled()
                    )

                await safeEditReply(interaction, { components: [row] })
                return;
            });
        }

        if (interaction.commandName == '추출') {
            await interaction.deferReply();
            const count = interaction.options.getNumber('횟수');

            const options = {
                inmate: interaction.options.getNumber('수감자') ?? 0,
                walpu: interaction.options.getNumber('발푸르기스의밤') ?? 0,
                anno: interaction.options.getNumber('아나운서') ?? 0,
            }

            const { weightQuery, characterQuery, egoQuery, annoQuery } = drawQuery(options);

            const weight = db.prepare(weightQuery).all();
            const totalWeight = weight.reduce((sum, item) => sum + item.weight, 0);

            const characterList = db.prepare(characterQuery).all();
            const egoList = db.prepare(egoQuery).all();
            const annoList = db.prepare(annoQuery).all();

            // 뽑기 진행
            let extractList = []
            for (let i = 0; i < count; i++) {
                const randomValue = Math.random() * totalWeight;

                // 10연차는 마지막에 2성 이상 확정
                if (count == 10 && i == 9) {
                    let star2 = weight.find((data) => data.star == 2);
                    let star1 = weight.find((data) => data.star == 1);
                    star2.weight += star1.weight;
                    star1.weight = 0;
                }
                let weightSum = 0;
                for (let j = 0; j < weight.length; j++) {
                    weightSum += weight[j].weight;
                    if (randomValue <= weightSum) {
                        if (weight[j].star == 'ego') {
                            const resultEgo = egoList[Math.floor(Math.random() * egoList.length)];
                            extractList.push({
                                type: 'ego',
                                result: resultEgo,
                                disable: false
                            });

                            // 에고 중복 추출 방지
                            egoList.splice(egoList.findIndex(e => e.id == resultEgo.id), 1);
                        } else if (weight[j].star == 'anno') {
                            const resultAnno = annoList[Math.floor(Math.random() * annoList.length)];
                            extractList.push({
                                type: 'anno',
                                result: resultAnno,
                                disable: false
                            });
                        } else {
                            const character = characterList.filter(char => char.star == weight[j].star);
                            extractList.push({
                                type: 'character',
                                result: character[Math.floor(Math.random() * character.length)],
                                disable: false
                            });
                        }
                        break;
                    }
                }
            }

            // 뽑기 결과로 임베드 색 결정
            let embedColor;
            if (extractList.some(item => item.result.walpu == 1)) {
                embedColor = 'Green';
            } else if (extractList.some(item => item.result.star === 3 || item.type === 'anno' || item.type === 'ego')) {
                embedColor = 'Yellow';
            } else {
                embedColor = 'Red';
            }

            let embed = cb.embedBuilder(embedColor).setDescription('ㅤㅤㅤㅤㅤㅤㅤㅤ');
            let { row1, row2, all } = cb.drawButton(extractList);

            const response = await safeEditReply(interaction, { embeds: [embed], components: count == 1 ? [row1] : [row1, row2, all] })

            const collector = response.createMessageComponentCollector({
                time: 180_000,  // 3분
                filter: i => {
                    if (i.user.id !== interaction.user.id) {
                        i.reply({
                            content: '이 버튼은 뽑기를 시작한 사람만 누를 수 있습니다.',
                            flags: 64
                        });
                        return false;
                    }
                    return true;
                }
            });

            let resArr = [];
            collector.on('collect', async i => {
                if (i.customId == 'all') {
                    extractList.forEach((item, i) => {
                        if (!item.disable) {
                            resArr.push(drawResult(item));
                            item.disable = true;
                        }
                    });
                } else {
                    resArr.push(drawResult(extractList[Number(i.customId)]));
                    extractList[Number(i.customId)].disable = true;
                }

                ({ row1, row2, all } = cb.drawButton(extractList));
                embed = cb.embedBuilder(embedColor).setDescription(resArr.join('\n'));

                await safeUpdate(i, { embeds: [embed], components: count == 1 ? [row1] : [row1, row2, all] })

                if (extractList.every(item => item.disable == true) || extractList.length <= 0) {
                    collector.stop();
                }

                return;
            })

            collector.on('end', async () => {
                row1 = cb.disabledComponents(row1);
                const components = [row1];
                if(count != 1) {
                    row2 = cb.disabledComponents(row2)
                    components.push(row2)
                }
                await safeEditReply(interaction, { embeds: [embed], components: components })
                return;
            })
        }

        if (interaction.commandName === '추출횟수계산') {
            const lunacy = interaction.options.getNumber('광기') ?? 0;
            const ticket1 = interaction.options.getNumber('1회티켓') ?? 0;
            const ticket10 = interaction.options.getNumber('10회티켓') ?? 0;

            if (!lunacy && !ticket1 && !ticket10) {
                await interaction.reply({
                    content: '최소 한개의 옵션을 작성해주세요.',
                    flags: 64
                });
                return;
            }
            await interaction.deferReply();

            const embed = cb.embedBuilder('DarkRed').setTitle('추출 횟수 계산');

            const fields = [
                lunacy ? { name: '광기', value: `**${lunacy}개**`, inline: true } : null,
                ticket1 ? { name: '1회티켓', value: `**${ticket1}개**`, inline: true } : null,
                ticket10 ? { name: '10회티켓', value: `**${ticket10}개**`, inline: true } : null
            ].filter(Boolean);

            embed.addFields(
                ...fields,
                { name: '총 추출 횟수', value: `__**${Math.floor((lunacy / 130) + ticket1 + (ticket10 * 10))}회**__` }
            );

            await safeEditReply(interaction, { embeds: [embed] })
        }
    } catch (e) {
        console.error(e);
    }
});

client.login(process.env.TOKEN);