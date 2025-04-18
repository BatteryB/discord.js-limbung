// TODO
// 검색 결과 표시 구현
// 페이징 구현

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

    if (interaction.commandName == '에깊조합식') {
        await interaction.deferReply();

        const tire = interaction.options.getString('티어');
        const keyword = interaction.options.getString('키워드');
        const name = interaction.options.getString('이름');

        // 기본 쿼리문과 파라미터 선언
        let query = `SELECT g.name, k.name as 'keyword', g.tire, g.comb, g.hard, g.limited FROM gift g JOIN keyword k ON g.keyword = k.id WHERE 1 = 1`;
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
        query += ` ORDER BY g.tire, g.keyword`

        const giftResult = db.prepare(query).all(...queryParams);
        console.log(giftResult);

        // 결과값 3개씩 나눠서 2차원배열로 정리
        let giftList = [], giftIndex = 0;
        for (let i = 0; i < giftResult.length; i += 3) {
            const arr = giftResult.slice(i, i + 3);
            giftList.push(arr);
        }

        console.log(giftList)

        const embed = giftEmbedBuilder(giftList[giftIndex]);

        embed.setFooter({
            text: `${giftIndex + 1} / ${giftList.length}`
        })

        const response = await interaction.editReply({
            embeds: [embed],
            components: [pageButtonBuilder(false)]
        });

        const collector = response.createMessageComponentCollector({
            time: 180_000
        });

        collector.on('collect', async i => {
            

            // collector.stop();
        })

        // collector.on('end', async () => {
        //     const disabledButtons = pageButtonBuilder(true);
        //     await interaction.editReply({
        //         components: [disabledButtons]
        //     });
        //     return;
        // });
    }
});

function giftEmbedBuilder(gift) {
    const embed = new EmbedBuilder()
        .setTitle('조합 에고기프트 목록')
        .setDescription('ㅤ')
        .setColor('DarkRed');

    let idx = 1;
    gift.forEach(gift => {
        embed.addFields({
            name: `${idx}. ${gift.name}`,
            value: `${gift.keyword} / ${gift.tire}티어`
        });
        idx++;
    });

    return embed;
}

function pageButtonBuilder(disable) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setLabel('⏪이전')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable),
            new ButtonBuilder()
                .setCustomId('0')
                .setLabel('1️⃣')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable),
            new ButtonBuilder()
                .setCustomId('1')
                .setLabel('2️⃣')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable),
            new ButtonBuilder()
                .setCustomId('2')
                .setLabel('3️⃣')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('다음⏩')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable),
        )
}

client.login(process.env.TOKEN);


