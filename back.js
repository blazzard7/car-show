const express = require('express');
const app = express();
const port = 1111;

class Vehicles {
  constructor(model, price, year, color) {
   
    
    this.model = model;
    this.price = price;
    this.year = year;
    this.color = color;
  }
}


class Car extends Vehicles {
  constructor(model, price, year, color) {
    super(model, price, year, color);
  }
}

class MotoBike extends Vehicles {
  constructor(model, price, year, color) {
    super(model, price, year, color);
  }
}

class VehicleRepository {
  constructor() {
    this.vehicles = [];
    this.idCounter = 1;
  }

  addVehicle(vehicle) {
    vehicle.id = this.idCounter;
    this.idCounter++;
    this.vehicles.push(vehicle);
    return vehicle;
  }

  getVehicleById(id) {
    return this.vehicles.find(vehicle => vehicle.id === id);
  }

  updateVehicle(id, model, price, year, color) {
    const index = this.vehicles.findIndex(vehicle => vehicle.id === id);
    if (index !== -1) {
      try {
        const vehicleToUpdate = this.vehicles[index];
        vehicleToUpdate.model = model;
        vehicleToUpdate.price = price;
        vehicleToUpdate.year = year;
        vehicleToUpdate.color = color;
        return vehicleToUpdate;
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }

  deleteVehicle(id) {
    const index = this.vehicles.findIndex(vehicle => vehicle.id === id);
    if (index !== -1) {
      return this.vehicles.splice(index, 1)[0];
    } else {
      return null;
    }
  }

  
  searchVehicles(type, parameter, value, isExact) {
    const searchFunc = isExact
      ? (item, val) => item[parameter] === val
      : (item, val) => item[parameter].toString().toLowerCase().includes(val.toLowerCase());

    return this.vehicles.filter(
      vehicle =>
        vehicle instanceof type &&
        searchFunc(vehicle, value)
    );
  }

 
  searchCars(parameter, value) {
    return this.searchVehicles(Car, parameter, value, false);
  }

  searchMotoBikes(parameter, value) {
    return this.searchVehicles(MotoBike, parameter, value, false);
  }

 
  searchCarsExact(parameter, value) {
    return this.searchVehicles(Car, parameter, value, true);
  }

  searchMotoBikesExact(parameter, value) {
    return this.searchVehicles(MotoBike, parameter, value, true);
  }

  listCars() {
    return this.vehicles.filter(vehicle => vehicle instanceof Car);
  }

  listMotoBikes() {
    return this.vehicles.filter(vehicle => vehicle instanceof MotoBike);
  }

  listVehicles() {
    return this.vehicles;
  }
}

const repository = new VehicleRepository();
repository.addVehicle(new Car("X5", 5000000, 2020, "Черный"));
repository.addVehicle(new Car("X3", 3000000, 2021, "Белый"));
repository.addVehicle(new MotoBike("S1000R", 1000100, 2015, "Синий"));

app.use(express.json());

// GET /vehicles - получить все транспортные средства
app.get('/vehicles', (req, res) => {
  const vehicles = repository.listVehicles();
  res.json(vehicles);
});

// GET /vehicles/cars - получить все автомобили
app.get('/vehicles/cars', (req, res) => {
  const cars = repository.listCars();
  res.json(cars);
});

// GET /vehicles/motobikes - получить все мотоциклы
app.get('/vehicles/motobikes', (req, res) => {
  const motoBikes = repository.listMotoBikes();
  res.json(motoBikes);
});

// GET /vehicles/:id - получить транспортное средство по id
app.get('/vehicles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const vehicle = repository.getVehicleById(id);
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404).json({ error: 'Транспортное средство не найдено' });
  }
});

// POST /vehicles/cars - добавить новый автомобиль
app.post('/vehicles/cars', (req, res) => {
  const { model, price, year, color } = req.body;
  if (!model || price < 0 || year < 0 || !color) {
    res.status(400).json({ error: 'Пожалуйста, убедитесь, что все поля заполнены и цена/год выпуска не отрицательные' });
    return;
  }

  try {
    const newCar = new Car(model, price, year, color);
    repository.addVehicle(newCar);
    res.status(201).json(newCar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /vehicles/motobikes - добавить новый мотоцикл
app.post('/vehicles/motobikes', (req, res) => {
  const { model, price, year, color } = req.body;
  if (!model || price < 0 || year < 0 || !color) {
    res.status(400).json({ error: 'Пожалуйста, убедитесь, что все поля заполнены и цена/год выпуска не отрицательные' });
    return;
  }

  try {
    const newMotoBike = new MotoBike(model, price, year, color);
    repository.addVehicle(newMotoBike);
    res.status(201).json(newMotoBike);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /vehicles/:id - обновить транспортное средство по id
app.put('/vehicles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { model, price, year, color } = req.body;
  if (!model || price < 0 || year < 0 || !color) {
    res.status(400).json({ error: 'Пожалуйста, убедитесь, что все поля заполнены и цена/год выпуска не отрицательные' });
    return;
  }

  const updatedVehicle = repository.updateVehicle(id, model, price, year, color);
  if (updatedVehicle) {
    res.json(updatedVehicle);
  } else {
    res.status(404).json({ error: 'Транспортное средство не найдено или указаны некорректные данные' });
  }
});

// DELETE /vehicles/:id - удалить транспортное средство по id
app.delete('/vehicles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deletedVehicle = repository.deleteVehicle(id);
  if (deletedVehicle) {
    res.json(deletedVehicle);
  } else {
    res.status(404).json({ error: 'Транспортное средство не найдено' });
  }
});

// GET /vehicles/cars/search?parameter=model&value=X - поиск автомобилей по параметру
app.get('/vehicles/cars/search', (req, res) => {
  const parameter = req.query.parameter;
  const value = req.query.value;
  if (!parameter || !value) {
    res.status(400).json({ error: 'Не указаны параметр или значение для поиска' });
    return;
  }
  const foundCars = repository.searchCars(parameter, value);
  res.json(foundCars);
});

// GET /vehicles/motobikes/search?parameter=value - поиск мотоциклов по параметру
app.get('/vehicles/motobikes/search', (req, res) => {
  const parameter = req.query.parameter;
  const value = req.query.value;
  if (!parameter || !value) {
    res.status(400).json({ error: 'Не указаны параметр или значение для поиска' });
    return;
  }
  const foundMotoBikes = repository.searchMotoBikes(parameter, value);
  res.json(foundMotoBikes);
});

// GET /vehicles/cars/searchExact?parameter=model&value=X5 - точный поиск автомобилей по параметру
app.get('/vehicles/cars/searchExact', (req, res) => {
  const parameter = req.query.parameter;
  const value = req.query.value;
  if (!parameter || !value) {
    res.status(400).json({ error: 'Не указаны параметр или значение для поиска' });
    return;
  }
  const foundCars = repository.searchCarsExact(parameter, value);
  res.json(foundCars);
});

// GET /vehicles/motobikes/searchExact?parameter=model&value=S1000R - точный поиск мотоциклов по параметру
app.get('/vehicles/motobikes/searchExact', (req, res) => {
  const parameter = req.query.parameter;
  const value = req.query.value;
  if (!parameter || !value) {
    res.status(400).json({ error: 'Не указаны параметр или значение для поиска' });
    return;
  }
  const foundMotoBikes = repository.searchMotoBikesExact(parameter, value);
  res.json(foundMotoBikes);
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});