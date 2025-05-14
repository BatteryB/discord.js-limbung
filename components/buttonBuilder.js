import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function drawButton(list) {
    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();

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

export function pageButtonBuilder() {
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

export function effectButtonBuilder(gift) {
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