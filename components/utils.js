export function drawResult(drow) {
    if (drow.type == 'character') {
        return `[${'0'.repeat(Number(drow.result.star))}] ${drow.result.name} ${drow.result.inmate}`
    } else if (drow.type == 'anno') {
        return `[아나운서] ${drow.result.name}`
    } else {
        return `[${drow.result.rating}] ${drow.result.name} ${drow.result.inmate}`
    }
}

export async function safeUpdate(i, detail) {
    try {
        await i.update(detail)
    } catch (_) {}
}

export async function safeEditReply(i, detail) {
    try {
        await i.editReply(detail)
    } catch (_) {}
}