import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config({ path: 'env/token.env' });

const commands = [
    {
        name: '에고기프트',
        description: '에고기프트를 검색합니다. (모든 옵션을 적을 필요는 없습니다!)',
        options: [
            {
                name: '티어',
                description: '티어로 검색하기 (선택)',
                type: 3,
                required: false,
                choices: [
                    {
                        name: "1",
                        value: "1"
                    },
                    {
                        name: "2",
                        value: "2"
                    },
                    {
                        name: "3",
                        value: "3"
                    },
                    {
                        name: "4",
                        value: "4"
                    },
                    {
                        name: "5",
                        value: "5"
                    },
                ]
            },
            {
                name: '키워드',
                description: '키워드로 검색하기 (선택)',
                type: 3,
                required: false,
                choices: [
                    {
                        name: "범용",
                        value: "0"
                    },
                    {
                        name: "화상",
                        value: "1"
                    },
                    {
                        name: "출혈",
                        value: "2"
                    },
                    {
                        name: "진동",
                        value: "3"
                    },
                    {
                        name: "파열",
                        value: "4"
                    },
                    {
                        name: "침잠",
                        value: "5"
                    },
                    {
                        name: "호흡",
                        value: "6"
                    },
                    {
                        name: "충전",
                        value: "7"
                    },
                    {
                        name: "참격",
                        value: "8"
                    },
                    {
                        name: "관통",
                        value: "9"
                    },
                    {
                        name: "타격",
                        value: "10"
                    },
                ]
            },
            {
                name: '이름',
                description: '이름으로 검색하기 (선택)',
                type: 3,
                required: false
            },
            {
                name: '재료',
                description: '재료 이름으로 검색하기 (선택)',
                type: 3,
                required: false
            },
            {
                name: '타입',
                description: '일반 or 조합 기프트만 검색하기 (선택)',
                type: 3,
                required: false,
                choices: [
                    {
                        name: "일반",
                        value: "일반"
                    },
                    {
                        name: "조합",
                        value: "조합"
                    },
                ]
            },
        ]
    },
    {
        name: '추출',
        description: '인격, E.G.O 추출을 진행합니다. (모든 옵션을 적을 필요는 없습니다!)',
        options: [
            {
                name: '횟수',
                description: '추출횟수를 지정합니다. (필수)',
                type: 10,
                required: true,
                choices: [
                    {
                        name: "1회추출",
                        value: 1
                    },
                    {
                        name: "10회추출", 
                        value: 10
                    },
                    {
                        name: "3성확정", 
                        value: 9
                    },
                ]
            },
            {
                name: '발푸르기스의밤',
                description: '발푸르기스의밤 인격, E.G.O 포함 여부를 결정합니다.(기본 미포함) (선택)',
                type: 10,
                required: false,
                choices: [
                    {
                        name: "포함",
                        value: 1
                    },
                    {
                        name: "미포함", 
                        value: 0
                    }
                ]
            },
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}