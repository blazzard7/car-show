const express = require("express");
const app = express();
const jsonInterpretator = express.json();
var cors = require('cors')

let repo = [ 
  {
    number: 1,
    phone: +79001231231,
    wishes: "животные",
    adres: "генеральская 3",
    apartmens: "308",
    client: "Старцев",
    check_in: "02-02-2024",
    departure: "",
    admin: "Андрей",
    status: "Заселен"
  } 
];

let isUpdateStatus = false;
let massage = "";
app.use(cors())

app.get("/orders", (req, res) => { 
  if (isUpdateStatus) {
    res.send({ repo, message: massage });
    isUpdateStatus = false;
    massage = "";
  } else {
    res.send(repo);
  }
});

app.post("/ord", jsonInterpretator, (req, res) => {
  let buffer = req.body;

  // Преобразуем даты в объекты Date
  const newCheckIn = new Date(buffer.check_in);
  const newDeparture = new Date(buffer.departure);

  // Устанавливаем статус в зависимости от дат
  if (newCheckIn <= new Date()) {
    buffer.status = "Заселен";
  } else if (newDeparture <= new Date()) {
    buffer.status = "Выселен";
  } else if (newDeparture < newCheckIn) { // Если дата выезда меньше даты заселения
    buffer.status = "Забронирован";
  } else {
    buffer.status = "Забронирован"; 
  }

  repo.push(buffer);
  res.send(buffer);
});

// редактирование
app.put("/ord/:num", jsonInterpretator, (req, res) => {
  let buffer = req.body;
  let num = req.params.num;
  let index = 0;

  if (!buffer) res.sendStatus(404);

  for (let i = 0; i < repo.length; i++) {
    if (repo[i].number == num) {
      index = i;
      const ord = repo[i];
      
      const newCheckIn = new Date(buffer.check_in); // Преобразуем в Date
      const newDeparture = new Date(buffer.departure); // Преобразуем в Date

      ord.check_in = buffer.check_in;
      ord.wishes = buffer.wishes;
      ord.departure = buffer.departure;
      ord.admin = buffer.admin;
      ord.status = buffer.status;

      // Обновляем статус в зависимости от дат
      if (newCheckIn <= new Date()) {
        ord.status = "Заселен";
      } 
      if (newDeparture <= new Date()) {
        ord.status = "Выселен";
      } else if (newDeparture < newCheckIn) { // Если дата выезда меньше даты заселения
        ord.status = "Забронирован";
      } 

      if (newDeparture!= buffer.departure) {
        isUpdateDate = true;
        massage += "Дата въезда по заявке" + ord.number + " изменена. ";
      }
      console.log(massage)
    }
  }
  res.json(repo[index]);
});


app.put("/wishes/:num", jsonInterpretator, (req, res) => {//добавления комментария
  let buffer = req.body;
  let num = req.params.num;
  let index = 0;

  if (!buffer) res.sendStatus(404);

  for (let i = 0; i < repo.length; i++) {
    if (repo[i].number == num) {
      index = i;
      const ord = repo[i];
      ord.wishes=buffer.wishes

      
  }
  res.json(repo[index]);}
});

app.get("/:num", (req, res) => {
  let num = req.params.num;
  for (let i = 0; i < repo.length; i++)
    if (repo[i].number == num) {
      res.send(repo[i]);
      return;
    }
  res.send("не найдено");
});

app.get("/filter/:param", (req, res) => {
  let param = req.params.param;
  let result = [];
  for (let i = 0; i < repo.length; i++)
    if (
      repo[i].adres == param ||
      repo[i].wishes == param ||
      repo[i].apartmens == param ||
      repo[i].client == param
    ) {
      result.push(repo[i]);
    }
  res.send(result);
});

app.get("/stats/completed", (req, res) => {
  let completedOrders = repo.filter(order => order.status === "Выселен");
  res.send({ count: completedOrders.length });
});

app.get("/stats/avgtime", (req, res) => {
  let completedOrders = repo.filter(order => order.status === "Выселен");
  if (completedOrders.length === 0) {
    res.send({ avgTime: 0 });
    return;
  }
  let totalDays = completedOrders.reduce((acc, order) => {
    let checkInDate = new Date(order.check_in);
    let departureDate = new Date(order.departure);
    let days = (departureDate - checkInDate) / (1000 * 60 * 60 * 24); // Делим на миллисекунды в сутках
    return acc + days;
  }, 0);
  let avgTime = totalDays / completedOrders.length;
  res.send({ avgTime: avgTime });
});
app.get("/stats/rooms", (req, res) => {
  const roomOccupancyStats = {};

  repo.forEach((order) => {
    const apartmentNumber = order.apartmens;
    const key = apartmentNumber; // Ключ - номер комнаты

    if (roomOccupancyStats[key]) {
      roomOccupancyStats[key]++;
    } else {
      roomOccupancyStats[key] = 1;
    }
  });

  res.send(roomOccupancyStats);
});
app.get("/stats", (req, res) => {
  res.send({
    completedOrdersCount: completedOrders,
    avgTime: avgTime,
    roomOccupancyStats: roomOccupancyStats
  });
});


app.listen(7777);