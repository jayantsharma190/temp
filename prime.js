var originalTarget = 600851475143;
var target = originalTarget;
var i = 2;
while(i<target) {
	while(target%i === 0) {
		(function(newtarget) {
			console.log(target + " can be divided by " + i + " which gives us " + newtarget);
			target = newtarget;
		})
		(target / i)
	}
	i++;
}
console.log("it seems like " + target + " is the biggest prime factor for " + originalTarget);