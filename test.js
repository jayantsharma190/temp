let num,rev=0,rem,large,x;
for(let i=12;i<100;i++){
	for(let j=11;j<100;j++){
		num=i*j;
		x=num;	
        while(num!==0){
	 rem=num%10;
	 rev=rev*10+rem;
	 num=Math.floor(num/10);
	 }
      if(x===rev){
         large=x;}

    }
}
console.log(large);