function Car(brand) {
  this.brand = brand;
  this.honk = function() {
    console.log(this.brand + ' honks!');
  }
}

var car1 = new Car('audi');
car1.honk();

var car2 = new Car('bmw');
car2.honk();

function Car2(brand) {
  this.brand = brand;
}
Car2.prototype.honk = function() {
  console.log(this.brand + ' honks!');
};

var car1 = new Car2('audi');
car1.honk();

var car2 = new Car2('bmw');
car2.honk();

function getCar(spec) {
  spec = spec || {};

  var brand = spec.brand || 'unknown';

  var honk = function() {
    console.log(brand + ' honks!');
  };

  return {
    honk: honk
  };
}

var car1 = getCar({ brand: 'audi'});
car1.honk();

var car2 = getCar({ brand: 'bmw'});
car2.honk();

var car3 = getCar();
car3.honk();

function getVehicle(spec) {
  spec = spec || {};

  var vehicle = {};
  vehicle.brand = spec.brand || 'unknown';

  vehicle.honk = function() {
    console.log(vehicle.brand + ' honks!');
  };

  return vehicle;
}

function getTruck(spec) {
  var truck = getVehicle(spec);

  truck.honkLoudly = function() {
    console.log(truck.brand + ' HONKS!');
  };

  return {
    honk: truck.honk,
    honkLoudly: truck.honkLoudly
  }
}

var veh = getVehicle({ brand: 'volvo'});
veh.honk();
console.log(veh.brand);

var truck = getTruck({ brand: 'zil'});
truck.honk();
truck.honkLoudly();