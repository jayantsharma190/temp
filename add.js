let add=0,a;
const sum=(number)=>{
for(let i=0;i<5;i++){
a=number%10;
add=add+a;
number=number/10;
}
return add;
}
console.log(sum(12345));