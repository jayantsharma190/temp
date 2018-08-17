let orderCount=0;
const getOrder=(flavour)=>{
	orderCount++;
	console.log('order'+orderCount+':'+ flavour +' icecream');
}
getOrder('vanilla');
getOrder('butterScotch');
getOrder('nuts');
console.log('number of orders are '+orderCount);
console.log('your total amount is '+orderCount*10);
