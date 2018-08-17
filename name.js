let num1=[1,2,3,4,5];
let num2=[6,7,8,9,10];
console.log(num1.reduce((a,b)=>a+b));
console.log('largest is '+num1.reduce((a,b)=>a>b?a:b));
console.log((num1,num2).reduce((c,d)=>c>d?c:d));