import { EmbedBuilder } from "discord.js";

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