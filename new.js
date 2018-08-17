let person={
	_name: 'Jayant',
	_age: 17,
	_hobby: 'football',
	set hobby(value) {
		if(value==='eating'){
			this._hobby=value;
			return 'u enter a correct hobby';
		}
		else{
           console.log('enter a correct hobby')
		}
	},
	get hobby() {
		console.log(this._name + '' + ' new hobby is: ' + this._hobby );
		return this._hobby;
	} 
}
person.hobby='eating';
console.log(person.hobby);