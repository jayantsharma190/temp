var fib = [1,2];
var i = 0;
var sum = 0;
while (fib[0] + fib[1] < 4000000){
    i = fib[0] + fib[1];
    console.log(i); //just to show myself the number came out correctly.
    fib[0] = fib[1];
    fib[1] = i;

    if (i % 2 === 0){
        sum += i;
    }
}
console.log(sum + 2);