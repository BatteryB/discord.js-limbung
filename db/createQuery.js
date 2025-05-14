export function giftQuery({ tire, keyword, name, material, type }) {
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

    return { query, queryParams };
}

export function drawQuery({ walpu, anno }) {
    let weightQuery = `
                select 
                    star, 
                    weight
                from prob
                where type = n${anno ? "'anWeight'" : "'weight'"}
            `;

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

    return { weightQuery, characterQuery, egoQuery, annoQuery }
}