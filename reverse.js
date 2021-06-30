let rev=0,rem;
let num=246;
while(num!==0){
	rem=num%10;
	rev=rev*10+rem;
	num=Math.floor(num/10);
}
console.log('your reverse number is: '+rev);