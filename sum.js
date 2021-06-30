let num=1000;
let i;let sum=0;
for(i=1;i<num;i++)
 {
 if(i%3===0 || i%5===0)
 sum+=i;
 }
 console.log(sum);