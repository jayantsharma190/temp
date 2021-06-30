let a,b=1,c=1,i,sum=0;
for(sum;sum<4000000;)
 {
 	a=b+c;
 	b=c;
 	c=a;
 	if(c%2===0)
 	{
 		sum=sum+c;
 	}
 }
 console.log(sum);