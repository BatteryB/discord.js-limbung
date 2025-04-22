import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Events, GatewayIntentBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

        // 기본 쿼리문과 파라미터 선언
        let query = `SELECT g.name, k.name as 'keyword', g.tire, g.comb, g.hard, g.limited, g.effect1, g.effect2, g.effect3 FROM gift g JOIN keyword k ON g.keyword = k.id WHERE 1 = 1`;
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
                        .setCustomId('')
                        .setLabel('검색시간이 끝났습니다.')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled()
                )
            await interaction.editReply({
                components: [row]
            });
            return;
        });
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
    });

    return embed;
}

function giftInfoEmbedBuilder(gift, effect) {
    const embed = new EmbedBuilder()
        .setTitle(gift.name)
        .setDescription(`${gift.hard ? '하드 전용 기프트' : ''}\n${gift.limited != 'none' ? `"${gift.limited}" 전용` : ''}`)
        .addFields(
            { name: '키워드', value: gift.keyword, inline: true },
            { name: '티어', value: gift.tire.toString(), inline: true },
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