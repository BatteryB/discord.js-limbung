import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export function drawButton(list) {
    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();

    list.forEach((res, i) => {
        let color;
        if (res.result.walpu) {
            color = ButtonStyle.Success; // 녹색
        } else if (
            res.result.star == 3 ||
            res.type == 'ego' ||
            res.type == 'anno'
        ) {
            color = ButtonStyle.Primary; // 파란색
        } else if (res.result.star == 2) {
            color = ButtonStyle.Danger; // 빨간색
        } else {
            color = ButtonStyle.Secondary; // 회색
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

export function embedBuilder(color) {
    return new EmbedBuilder()
        .setColor(color);
};

export function giftEmbedBuilder(giftArr) {
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
    }); 6

    return embed;
}

export function giftInfoEmbedBuilder(gift, effect) {
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

export function disabledComponents(row) {
    return new ActionRowBuilder().addComponents(
        row.components.map(button => ButtonBuilder.from(button).setDisabled(true))
    );
}