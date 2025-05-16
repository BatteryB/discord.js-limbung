export function drawResult(drow) {
    if (drow.type == 'character') {
        return `[${'0'.repeat(Number(drow.result.star))}] ${drow.result.name} ${drow.result.inmate}\n`
    } else if (drow.type == 'anno') {
        return `[아나운서] ${drow.result.name}\n`
    } else {
        return `[${drow.result.rating}] ${drow.result.name} ${drow.result.inmate}\n`
    }
}