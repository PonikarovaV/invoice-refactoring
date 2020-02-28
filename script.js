'use strict';

const orders = [
    {
        "customer": "MDT",
        "performance": [ 
            {
                "playId": "Гамлет", 
                "audience": 55,
                "type": "tragedy" 
            },
            {
                "playId": "Ромео и Джульетта",
                "audience": 35,
                "type": "tragedy" 
            },
            {
                "playId": "Отелло", 
                "audience": 40, 
                "type": "comedy"
            } 
        ]
    },
    {
        "customer": "Морковкин и Ко",
        "performance": [ 
            {
                "playId": "Гамлет", 
                "audience": 70,
                "type": "tragedy" 
            },
            {
                "playId": "Ромео и Джульетта",
                "audience": 20,
                "type": "tragedy" 
            },
            {
                "playId": "Отелло", 
                "audience": 100, 
                "type": "comedy"
            } 
        ]
    },
]

/** функция-агрегатор */
function statement(invoice, plays) {
    // получаем объект с неоходимыми для счета данными (сумма, бонусы, количество мест, название спектакля отдельно по каждому спектаклю)
    let fieldsValues = plays.map( play => { return dispense(play) }) || {};
    // считаем общие суммы (общая сумма счета, общее количество бонусов)
    let amounts = totalAmountCounter(fieldsValues);

    // переводим сумму в рубли
    const formatAmount = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 2 }).format(`${amounts.amount / 100}`);

    //возвращаем строки счета
    return `
    Счет для ${invoice}\n
    ${fieldsValues.map( invoice => addString(invoice)).join('\n') }
    Итого с вас ${formatAmount}
    Вы заработали ${amounts.credits} бонусов\n
    `
}

/** распределяем задачи по массиву: отдельно считаем суммы по спектаклям, сохраняем название спектакля, количество мест в один объект; отдельно считаем бонусы */
function dispense(play) {
    let summary = countAmount(play) || {};
    let volumeCredits = countCredit(play) || 0;

    return { summary, credits: volumeCredits };
}

/** подсчет сумм по спектаклям */
function countAmount (play) {
    let totalAmount = 0;
    let playName = play.playId;
    let playAudience = play.audience;
    
    switch (play.type) {
        
        case 'tragedy':
            totalAmount = 40000;
            if (play.audience > 30) {
                totalAmount += 1000 * (play.audience - 30);
            }
            break;
        case 'comedy':
            totalAmount = 30000;
            if (play.audience > 20) {
                totalAmount += 10000 + 500 * (play.audience - 20);
            }
            totalAmount += 300 * play.audience;
            break;
        default:
            throw new Error(`Неизвестный тип: ${play.type}`);
    }

    return { totalAmount, playName, playAudience };
}

/** подсчет бонусов */ 
function countCredit(play) {
    let volumeCredits = 0;

    volumeCredits += Math.max(play.audience - 30, 0);

    if (play.type === 'comedy') {
        volumeCredits += Math.floor(play.audience / 5);
    }

    return volumeCredits;
}

/** обрабатываем данные и создаем строки с суммами и местами отдельно по каждому спектаклю */
function addString(play) {
    const formatAmount = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 2 }).format(`${play.summary.totalAmount / 100}`);
    let string = `
    ${play.summary.playName}: ${formatAmount}\n
    (${play.summary.playAudience} мест)\n
    `
    return string;
}

/** подсчитываем общую сумму к оплате и общую сумму бонусов */
function totalAmountCounter(fieldsValues) {
    let amount = 0;
    let credits = 0;

    [...fieldsValues].forEach( el => {
        amount += el.summary.totalAmount;
        credits += el.credits;
    });
    
    return { amount, credits };
}

// вывод итоговых строк счета
orders.forEach( order => console.log(statement(order.customer, order.performance)) )



/* функция-тест для расчета суммы по одной пьесе **/
function testCount(name, counted, expected) {
    if (counted !== expected) {
        console.log(name + " failed: expected " + expected + ", got " + counted);
    } else {
        console.log(name + ": ok")
    }
}

/** функция-тест для расчета бонусов */
function testCredit(name, counted, expected) {
    if (counted !== expected) {
        console.log(name + " failed: expected " + expected + ", got " + counted);
    } else {
        console.log(name + ": ok")
    }
}

// тесты для расчета суммы по одной пьесе
let tragedy55 = orders[0].performance[0]
testCount("Tragedy55", countAmount(tragedy55).totalAmount, 65000);

let tragedy20 = {
    "playId": "Ромео и Джульетта",
    "audience": 20,
    "type": "tragedy" 
};
testCount("Tragedy20", countAmount(tragedy20).totalAmount, 40000);

let tragedy30 = {
    "playId": "Ромео и Джульетта",
    "audience": 30,
    "type": "tragedy" 
};
testCount("Tragedy30", countAmount(tragedy30).totalAmount, 40000);

let comedy40 = orders[0].performance[2]
testCount("Comedy40", countAmount(comedy40).totalAmount, 62000);

let comedy10 = {
    "playId": "Отелло", 
    "audience": 10, 
    "type": "comedy"
} ;
testCount("Comedy10", countAmount(comedy10).totalAmount, 33000);

let comedy20 = {
    "playId": "Отелло", 
    "audience": 20, 
    "type": "comedy"
};
testCount("Comedy20", countAmount(comedy20).totalAmount, 36000);

// тесты для расчета бонусов
let creditTragedy55 = orders[0].performance[0];
testCount("CreditTragedy55", countCredit(creditTragedy55), 25);

let creditTragedy20 = {
    "playId": "Отелло", 
    "audience": 20, 
    "type": "tragedy"
};
testCount("CreditTragedy20", countCredit(creditTragedy20), 0);

let creditComedy20 = {
    "playId": "Отелло", 
    "audience": 20, 
    "type": "comedy"
};
testCount("CreditComedy20", countCredit(creditComedy20), 4);

let creditComedy40 = {
    "playId": "Отелло", 
    "audience": 40, 
    "type": "comedy"
};
testCount("CreditComedy40", countCredit(creditComedy40), 18);
