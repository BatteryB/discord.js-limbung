// TODO
// 검색 기록 표시 구현
// 페이징 구현

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Events, GatewayIntentBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path'
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

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

        let query = `SELECT * FROM gift WHERE 1 = 1`;
        let queryParams = [];

        if (tire) {
            query += ` AND tire = ?`;
            queryParams.push(tire);
        }
        if (keyword) {
            query += ` AND keyword = ?`;
            queryParams.push(keyword);
        }
        if (name) {
            query += ` AND name LIKE ?`;
            queryParams.push(`%${name}%`);
        }

        const giftResult = db.prepare(query).all(...queryParams);

        const embed = embedBuilder();
        const buttons = pageButtonBuilder(false);

        console.log(giftResult);

        await interaction.editReply({
            embeds: [embed],
            components: [buttons]
        });

        return;
    }
});

function embedBuilder() {
    return new EmbedBuilder()
        .setTitle('조합 에고기프트 목록')
        .setDescription('ㅤ')
        .setColor('DarkRed');
}

function pageButtonBuilder(disable) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setLabel('⏪이전')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable ? true : false),
            new ButtonBuilder()
                .setCustomId('1')
                .setLabel('1️⃣')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable ? true : false),
            new ButtonBuilder()
                .setCustomId('2')
                .setLabel('2️⃣')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable ? true : false),
            new ButtonBuilder()
                .setCustomId('3')
                .setLabel('3️⃣')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable ? true : false),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('다음⏩')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disable ? true : false),
        )
}

client.login(process.env.TOKEN);


