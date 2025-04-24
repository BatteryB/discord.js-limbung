// TODO

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Events, GatewayIntentBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { stringify } from 'querystring';

dotenv.config({ path: 'env/token.env' });
const db = new Database(path.join(path.dirname(fileURLToPath(import.meta.url)), 'db', 'egoGift.db'));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == '에고기프트') {
        await interaction.deferReply();

        const tire = interaction.options.getString('티어');
        const keyword = interaction.options.getString('키워드');
        const name = interaction.options.getString('이름');
        const material = interaction.options.getString('재료');
        const type = interaction.options.getString('타입');

        // 기본 쿼리문과 파라미터 선언
        let query = `
            SELECT 
                g.name, 
                k.name as 'keyword', 
                g.tire, 
                g.cost, 
                g.comb, 
                g.hard, 
                g.limited, 
                g.effect1, 
                g.effect2, 
                g.effect3 
            FROM gift g 
            JOIN keyword k ON g.keyword = k.id 
            WHERE 1 = 1
        `;
        let queryParams = [];

        // where문 쿼리추가, 파라미터 추가
        if (tire) {
            query += ` AND g.tire = ?`;
            queryParams.push(tire);
        }
        if (keyword) {
            query += ` AND g.keyword = ?`;
            queryParams.push(keyword);
        }
        if (name) {
            query += ` AND g.name LIKE ?`;
            queryParams.push(`%${name}%`);
        }
        if (material) {
            query += ` AND g.comb LIKE ?`;
            queryParams.push(`%${material}%`);
        }
        if (type) {
            query += type == '일반' ? ` AND g.comb = 'none'` : ` AND g.comb != 'none'`
        }

        query += ` ORDER BY g.tire, g.keyword`

        const giftResult = db.prepare(query).all(...queryParams);

        if (giftResult.length <= 0) {
            interaction.editReply({
                content: "__***검색결과를 찾지 못했습니다.. ㅠㅠ***__"
            })
            return;
        }

        // 결과값 3개씩 나눠서 2차원배열로 정리
        let giftList = [], giftIndex = 0;
        for (let i = 0; i < giftResult.length; i += 3) {
            const arr = giftResult.slice(i, i + 3);
            giftList.push(arr);
        }

        const embed = giftEmbedBuilder(giftList[giftIndex]);
        embed.setFooter({
            text: `${giftIndex + 1} / ${giftList.length}`
        });

        const response = await interaction.editReply({
            embeds: [embed],
            components: [pageButtonBuilder(false)]
        });

        const collector = response.createMessageComponentCollector({
            time: 500_000 // 5분
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

                const embed = giftEmbedBuilder(giftList[giftIndex]);
                embed.setFooter({
                    text: `${giftIndex + 1} / ${giftList.length}`
                });

                await i.update({
                    embeds: [embed]
                });
            } else if (['effect1', 'effect2', 'effect3'].includes(i.customId)) {
                let effect;
                if (i.customId == 'effect1') {
                    effect = selectGift.effect1;
                } else if (i.customId == 'effect2') {
                    effect = selectGift.effect2;
                } else if (i.customId == 'effect3') {
                    effect = selectGift.effect3;
                }

                await i.update({
                    embeds: [giftInfoEmbedBuilder(selectGift, effect)]
                });
            } else {
                // giftlist에 현재 index의 선택한 위치 (2차원배열)
                selectGift = giftList[giftIndex][Number(i.customId)];
                if (!selectGift) {
                    await i.deferUpdate();
                    return;
                }

                const row = effectButtonBuilder(selectGift);
                const options = { embeds: [giftInfoEmbedBuilder(selectGift, selectGift.effect1)] };
                if (row) {
                    options.components = [row];
                } else {
                    options.components = [];
                }
                await i.update(options);
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
            await interaction.editReply({
                components: [row]
            });
            return;
        });
    }

    if (interaction.commandName == '추출') {
        await interaction.deferReply();
        const count = interaction.options.getNumber('횟수');
        const walpu = interaction.options.getNumber('발푸르기스의밤');
        const anno = interaction.options.getNumber('아나운서');

        let weightQuery = `
                select 
                    star, 
                    weight
                from prob
                where type = 
            `;

        // if (count == 9) {
        //     count++;
        //     weightQuery += anno ? "'anPickWeight'" : "'pickWeight'";
        // } else {
        //     weightQuery += anno ? "'anWeight'" : "'weight'";
        // }
        weightQuery += anno ? "'anWeight'" : "'weight'";


        const weight = db.prepare(weightQuery).all();
        const totalWeight = weight.reduce((sum, item) => sum + item.weight, 0);

        let characterQuery = `
            SELECT 
                i.id,
                i.name as 'inmate',
                p.star,
                p.name, 
                p.walpu
            FROM persona p
            JOIN inmate i ON i.id = p.inmate
            WHERE 1=1
        `;

        let egoQuery = `
            SELECT 
                e.id, 
                i.name as 'inmate', 
                e.name, 
                r.rating, 
                e.walpu
            FROM ego e
            JOIN inmate i ON i.id = e.inmate
            JOIN egoRating r ON r.id = e.rating
            WHERE 1=1
        `;

        let annoQuery = `
            SELECT
                name, 
                walpu
            FROM anno 
            WHERE 1=1
        `

        if (walpu == '0' || walpu == undefined) {
            characterQuery += ` AND walpu = 0`;
            egoQuery += ` AND walpu = 0`;
            annoQuery += ` AND walpu = 0`;
        }

        const characterList = db.prepare(characterQuery).all();
        const egoList = db.prepare(egoQuery).all();
        const annoList = db.prepare(annoQuery).all();

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

                        // 림버스에서 EGO는 중복이 나오지 않기 떄문에 뽑으면 제거
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

        let embedColor;
        if (extractList.some(item => item.result.walpu == 1)) {
            embedColor = 'Green';
        } else if (extractList.some(item => item.result.star === 3 || item.type === 'anno' || item.type === 'ego')) {
            embedColor = 'Yellow';
        } else {
            embedColor = 'Red';
        }

        let embed = embedBuilder(embedColor).setDescription('ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ');
        let { row1, row2, all } = drawButton(extractList);

        const response = await interaction.editReply({
            embeds: [embed],
            components: count == 1 ? [row1] : [row1, row2, all]
        })

        const collector = response.createMessageComponentCollector({
            time: 500_000 // 5분
        });

        let resTxt = '';
        collector.on('collect', async i => {
            if (i.customId == 'all') {
                extractList.forEach((item, i) => {
                    if(!item.disable) {
                        resTxt += drawResult(item);
                        item.disable = true;
                    }
                });
            } else {
                resTxt += drawResult(extractList[Number(i.customId)]);
                extractList[Number(i.customId)].disable = true;
            }

            ({ row1, row2, all } = drawButton(extractList));
            embed = embedBuilder(embedColor).setDescription(resTxt);
            
            await i.update({
                embeds: [embed],
                components: count == 1 ? [row1] : [row1, row2, all]
            })

            if (extractList.every(item => item.disable == true) || extractList.length <= 0) {
                collector.stop();
            }

            return;
        })

        collector.on('end', async () => {
            await interaction.editReply({
                embeds: [embed],
                components: [row1, row2]
            });
        })
    }
});

function giftEmbedBuilder(giftArr) {
    const embed = new EmbedBuilder()
        .setTitle('에고기프트 검색결과')
        .setColor('DarkRed');

    // 페이징 목록 표시
    let idx = 1;
    giftArr.forEach(gift => {
        embed.addFields({
            name: `${idx}. ${gift.name}`,
            value: `${gift.keyword} / ${gift.tire}티어`
        });
        idx++;
    });6

    return embed;
}

function embedBuilder(color) {
    return new EmbedBuilder()
        .setColor(color);
};

function drawButton(list) {
    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();

    console.log(JSON.stringify(list, null, 4))
    list.forEach((res, i) => {
        let color;
        if (res.result.walpu) {
            color = ButtonStyle.Success;
        } else if (
            res.result.star == 3 ||
            res.type == 'ego' ||
            res.type == 'anno'
        ) {
            color = ButtonStyle.Primary;
        } else if (res.result.star == 2) {
            color = ButtonStyle.Danger;
        } else {
            color = ButtonStyle.Secondary;
        }

        if (i < 5) {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId(String(i))
                    .setLabel('ㅤ')
                    .setStyle(color)
                    .setDisabled(res.disable)
            );
        } else {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(String(i))
                    .setLabel('ㅤ')
                    .setStyle(color)
                    .setDisabled(res.disable)
            );
        }
    });

    const all = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('all')
            .setLabel('전체확인')
            .setStyle(ButtonStyle.Secondary)
    )

    return {
        row1: row1,
        row2: row2,
        all: all
    }
}

function drawResult(drow) {
    if (drow.type == 'character') {
        return `[${'0'.repeat(Number(drow.result.star))}] ${drow.result.name} ${drow.result.inmate}\n`
    } else if (drow.type == 'anno') {
        return `[아나운서] ${drow.result.name}\n`
    } else {
        return `[${drow.result.rating}] ${drow.result.name} ${drow.result.inmate}\n`
    }
}

function giftInfoEmbedBuilder(gift, effect) {
    const embed = new EmbedBuilder()
        .setTitle(gift.name)
        .setDescription(`${gift.hard ? '하드 전용 기프트' : ''}\n${gift.limited != 'none' ? `"${gift.limited}" 전용` : ''}`)
        .addFields(
            { name: '키워드', value: gift.keyword, inline: true },
            { name: '티어', value: gift.tire.toString(), inline: true },
            { name: '가격', value: gift.cost.toString(), inline: true },
        )
        .setColor('DarkRed');

    if (gift.comb != 'none') {
        embed.addFields({ name: '조합식', value: gift.comb });
    }
    embed.addFields({ name: '효과', value: effect });

    return embed;
}

function pageButtonBuilder() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setLabel('⏪이전')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('0')
                .setLabel('1️⃣')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('1')
                .setLabel('2️⃣')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('2')
                .setLabel('3️⃣')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('다음⏩')
                .setStyle(ButtonStyle.Primary),
        )
}

function effectButtonBuilder(gift) {
    if (gift.effect2 != 'none') {
        var row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('effect1')
                .setLabel('기본효과')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('effect2')
                .setLabel('1강')
                .setStyle(ButtonStyle.Primary),
        )
    }
    if (gift.effect3 != 'none') {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('effect3')
                .setLabel('2강')
                .setStyle(ButtonStyle.Primary),
        )
    }

    return row;
}
client.login(process.env.TOKEN);