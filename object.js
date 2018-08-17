let person = {
	name: 'Jayant',
	age: 17,
	monday: 'milk',
	tuesday: 'bread',
	wednesday: 'pudding',
	thursday: 'rice'
};
person.hobbies=['football','walking'];
let marks=12;
let day;
if(marks<=5){
	day='monday';
}
else if(marks<12 && marks>5){
	day='tuesday';
}
else if(marks>=12&&marks<20){
	day='wednesday';
}
else if(marks>=20){ 
    day='thursday'
}
console.log(person.name+' will eat '+person[day])
person.gender='Male';
console.log(person.gender);
person.sayHello= hey()=>{
    return 'Hello, there!'
  }
  console.log(person.sayHello)