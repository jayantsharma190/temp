let rev=0,rem;
let num=246;
let x=num;
while(num!==0){
	rem=num%10;
	rev=rev*10+rem;
	num=Math.floor(num/10);
}
console.log('your reverse number is: '+rev);
if(x===rev){
	console.log('number is palindrome');
}
else if(x!==rev){
	console.log('number is not palindrome');
}