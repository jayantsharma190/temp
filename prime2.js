var n=500;
console.log('prime factorization is');
for(var i=2;i<n;i++){
	while(n%i===0){
		n=n/i;
		console.log(i);//to log each prime factor.
	}

}if(i===n){
	console.log('biggest prime factor is: '+i);
}
	else if(i>n)
  {
  	i--;
     console.log('biggest prime factor is: '+i);
  }
