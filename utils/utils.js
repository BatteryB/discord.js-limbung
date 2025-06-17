export function drawResult(drow) {
    if (drow.type == 'character') {
        return `[${'0'.repeat(Number(drow.result.star))}] ${drow.result.name} ${drow.result.inmate}`
    } else if (drow.type == 'anno') {
        return `[아나운서] ${drow.result.name}`
    } else {
        return `[${drow.result.rating}] ${drow.result.name} ${drow.result.inmate}`
    }
}