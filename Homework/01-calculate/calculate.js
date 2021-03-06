/*
*   最新版在re-cal.js
*
* 简易四则运算计算器说明：
*   简易四则运算器，支持+-/*%()运算
*   0。仅考虑了整数，可以区分正负整数。
*
*   1。未考虑括号中嵌套括号的情况 --- 好难。
*   2。未考虑存在非法字符 --- 不满足正则表达式的符号不会被匹配到。
*   3。未考虑浮点数 --- 无法匹配浮点数，但运算结果可以显示浮点数。尝试了写入浮点数，但是都存在问题。
*   4。存在多个连续运算符的是无法计算...  (4*5+6)-+-2 匹配出来也返回NaN
*
* branch 01bug:
*   0.  1+2*3-(4*5)*2 计算错误 减号被省略
*       A0:临时栈剩下的符号不一定只有1个了 也有也要循环从栈顶全部出栈
*   1.  括号内存在多个运算符时 优先级的判断有误
*       A1:存在括号时的优先级也要遵循原始规则
*   2.  对减号的正则匹配有误 原因：匹配规则是-前面有数字的才是减号 但实际上(4*5)-2  但是(-2+1)这里是负号...
*       A2:增加对减号的判断 (?<=\))- 即：-前面是后括号的也是减号而非负号
*
*   判断负号：第一个符号就是-说明是负号 还有+-连在一起判断后面是不是-不是就报错是就说明是-
*   小数点？
*   递归？非波拉契数列？阶乘？
*   shift数组第0位 pop数组最后一位
*
*
*   新思路：split shift
*   1    1*tmp==tmp || tem = . 说明是数字的一部分 判断是数字还是运算符
*       if(this.jud){
*           += ""
*           += jud拼接小数点前后
*       }
*   2    判断临时数组是否为空
*
*
* */

//计算器开始
let inpStr = "1+2*3-(4*5+6)-2+(-3+8/2-6)",//模拟输入
    finalStack = [],//最终生成逆波兰式的栈
    tempStack = [];//临时数组栈
//inpStr = inpStr.split("");//切割字符串并转为数组
//let reg = /(\d+)|(\+|\-|\*|\/|\(|\))/g;//匹配所有数字和+-*/%运算符 不匹配空格 无法区分负号和减号

let reg = /(?<=\))-|(?<=\d)-|-?\d+|\+|\*|\/|\(|\)/g,//支持区分负号和减号,可以匹配正负整数
    input = inpStr.match(reg);

console.log(input);//匹配后输入的表达式

// if (!reg.test(inpStr)) {
//     console.log("请勿输入非法字符！");
// }

//定义运算符优先级
let operator = {
    "+" : 0,
    "-" : 0,
    "*" : 1,
    "%" : 1,
    "/" : 1,
    "(" : 2,
    ")" : 2
};


//生成逆波兰式
function toReversePolish(finalPolish) {
    for (let i = 0,length = input.length; i < length; i++) {
        if (!isNaN(input[i])) { //判断是否是数字
            finalStack.push(parseInt(input[i]));//强制转换
        } else {
            if (tempStack.length !== 0) {//判断临时栈是否为空

                if (operator[input[i]] === 2) {//判断该运算符是括号

                    //判断tempStack里是否存在左括号
                    let index = tempStack.indexOf("(");//存在时返回索引到的序号
                    if ( index !== -1 ) {//不存在时indexOf返回-1

                        //存在括号 括号里运算符依次出栈并入finalStack
                        tempStack.push(input[i]);//当前右括号入栈，然后再删除
                        tempStack.pop();//删除栈顶右括号
                        for (let x = tempStack.length - 1; x >= index; x --) {
                            if (x === index) {
                                tempStack.pop();//遍历到括号时 直接删除
                            } else {
                                finalStack.push(tempStack.pop());//括号之前所有字符都入栈到finalStack
                            }
                        }
                    } else {
                        //不存在括号时 直接入栈
                        tempStack.push(input[i]);
                    }
                } else {//当前不是括号，遍历并判断运算符优先级

                    //当前项优先级低
                    if ( operator[input[i]] <= operator[tempStack[tempStack.length - 1]] ) {
                        let index = tempStack.indexOf("(");//判断是否存在左括号
                        //console.log(index);
                        if ( index !== -1 ) {
                            //存在括号 依次和括号之前的运算符比较优先级 优先级大于等于该运算符的都出栈到最终栈
                            for (let x = tempStack.length - 1; x > index; x--) {//x>index不会遍历到括号 括号之前的都按优先级排列
                                finalStack.push(tempStack.pop());
                            }
                            tempStack.push(input[i]);//循环判断结束 该项入栈
                            //tempStack.push(input[i]);
                        } else {
                            for (let j = tempStack.length - 1; j >= 0; j--) {
                                //不存在括号 比该项优先级大的全部依次出栈
                                finalStack.push(tempStack.pop());
                                if (tempStack.length === 0) {//直到数组为空 该项入栈
                                    tempStack.push(input[i]);
                                    //console.log(tempStack.push(input[i]));
                                }
                            }
                        }
                    } else {
                        //当前运算符优先级大于前一个优先级，直接入栈tempStack
                        tempStack.push(input[i]);
                    }
                }

            } else {//如果临时栈为空，直接进栈
                tempStack.push(input[i]);
            }
        }
        // console.log(finalStack);
        // console.log(tempStack);
    }
    //临时栈中剩余的字符全部入栈到finalStack
    if (tempStack.length) {
        //注意 临时栈不一定只剩1个数字了 要全部出栈
        for (let k = tempStack.length - 1; k >= 0; k--) {
            finalStack.push(tempStack.pop());
        }
    }
    //console.log(finalStack);
    return finalStack;//得到逆波兰式
}


//计算逆波兰式
(function calcPolish() {
    var finalPolish = toReversePolish(finalPolish);//得到逆波兰式
    console.log(finalPolish);//输出逆波兰表达式
    let finalRstStack = [];//最终结果栈

    for (let i = 0, length = finalPolish.length; i < length; i++) {
        if (isNaN(finalPolish[i])) {//判断是否是数字
            //不是数字 结果栈倒数两位出栈并计算
            let x = finalRstStack.pop(),//栈顶数字
                y = finalRstStack.pop(),//倒数第二位数字
                tempRst;//存储临时计算结果

            // console.log(x + '这是x');
            // console.log(y + '这是y');

            //判断运算符类型
            switch (finalPolish[i]) {
                case '+' :
                    tempRst = y + x;//注意加数和被加数的顺序
                    break;
                case '-' :
                    tempRst = y - x;
                    break;
                case '*' :
                    tempRst = y * x;
                    break;
                case '/' :
                    tempRst = y / x;
                    break;
                case '%' :
                    tempRst = y % x;
                    break;
            }
            finalRstStack.push(tempRst);//每一次运算结果入栈
        } else {
            //是数字 直接进栈
            finalRstStack.push(finalPolish[i]);
        }
        //console.log(finalRstStack);每一步的结果
    }
    console.log(finalRstStack);//输出最终结果
})();


