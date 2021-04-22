use master;
go

-- delete db if exists
if  db_id('TPP') is not null
    set noexec on; -- don't execute rest of commands
go

-- create db
create database TPP;
go

-- switch to db
use TPP;

-- create tables

CREATE TABLE Prices (
  PriceId INT PRIMARY KEY IDENTITY,
  PurchasePrice DECIMAL(10,2) DEFAULT NULL,
  HourlyPrice DECIMAL(10,2) DEFAULT NULL,
  DailyPrice DECIMAL(10,2) DEFAULT NULL,
  WeeklyPrice DECIMAL(10,2) DEFAULT NULL
);

CREATE TABLE Categories (
  CategoryId INT PRIMARY KEY IDENTITY,
  Name VARCHAR(100) NOT NULL UNIQUE,
);

CREATE TABLE Locations (
  LocationId INT PRIMARY KEY IDENTITY,
  Name VARCHAR(100) NOT NULL UNIQUE,
);

CREATE TABLE Items (
  ItemId INT PRIMARY KEY IDENTITY,
  Name VARCHAR(200) NOT NULL,
  PriceId INT REFERENCES Prices (PriceId),
  LocationId INT REFERENCES Locations (LocationId),
  CategoryId INT REFERENCES Categories (CategoryId)
);

CREATE TABLE PaymentMethods (
  PaymentMethodId INT PRIMARY KEY IDENTITY,
  CardNumber VARCHAR(16) NOT NULL,
  CardExpiration DATE NOT NULL,
  CardCVC INT NOT NULL
);

CREATE TABLE Customers (
  CustomerId INT PRIMARY KEY IDENTITY,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL,
  PhoneNumber VARCHAR(100) DEFAULT NULL,
  Address VARCHAR(150) DEFAULT NULL,
  PaymentMethodId INT REFERENCES PaymentMethods (PaymentMethodId)
);

CREATE TABLE Orders (
  OrderId INT PRIMARY KEY IDENTITY,
  ItemId INT REFERENCES Items (ItemId),
  CustomerId INT REFERENCES Customers (CustomerId),
  StartDate DATETIME NOT NULL,
  EndDate DATETIME NOT NULL,
  OrderTotal DECIMAL(10,2) NOT NULL,
  Status VARCHAR(45) NOT NULL
);

-- populate data

SET IDENTITY_INSERT Prices ON;

insert into Prices (PriceId, PurchasePrice, HourlyPrice, DailyPrice, WeeklyPrice) values
(1, 400, 20, 120, 240),
(2, 80, 10, 15, 25),
(3, 800, 25, 160, 310),
(4, 240, 15, 60, 120),
(5, 200, 12, 25, 35);

SET IDENTITY_INSERT Prices OFF;
SET IDENTITY_INSERT Categories ON;

insert into Categories (CategoryId, Name) values
(1, 'Snowboard'),
(2, 'Ice Skates'),
(3, 'Skis'),
(4, 'Toboggan'),
(5, 'Hockey Equipment');

SET IDENTITY_INSERT Categories OFF;
SET IDENTITY_INSERT Locations ON;

insert into Locations (LocationId, Name) values
(1, 'Windham Mountain'),
(2, 'Sunshine Village'),
(3, 'Rimrock Resort'),
(4, 'Crystal Mountain'),
(5, 'Granite Peak');

SET IDENTITY_INSERT Locations OFF;
SET IDENTITY_INSERT Items ON;

insert into Items (ItemId, Name, PriceId, LocationId, CategoryId) values
(1, 'Slope Shredder Snowboard', 1, 1, 1),
(2, 'Model A Ice Skates', 2, 2, 2),
(3, 'Snow Slicer Skis', 3, 1, 3),
(4, 'Tip Top Toboggan', 4, 3, 4),
(5, 'Wererider Snowboard', 1, 5, 1),
(6, 'Goalie Gear-Up', 5, 4, 5);

SET IDENTITY_INSERT Items OFF;
SET IDENTITY_INSERT PaymentMethods ON;

insert into PaymentMethods (PaymentMethodId, CardNumber, CardExpiration, CardCVC) values
(1, '2391283812831283', '01/10/2024', 123),
(2, '1234555566664320', '01/01/2024', 321),
(3, '7878878796964540', '01/04/2019', 456),
(4, '1223334444555550', '01/03/2024', 789),
(5, '5555544443332210', '01/01/2020', 987),
(6, '9887776666555550', '01/02/2023', 654);

SET IDENTITY_INSERT PaymentMethods OFF;
SET IDENTITY_INSERT Customers ON;

insert into Customers (CustomerId, Name, Email, PhoneNumber, Address, PaymentMethodId) values
(1, 'Charles Xavier', 'profx@gmail.com', '638 7293', '1407 Graymalkin Lane, Salem Center, NY', 1),
(2, 'Wade Wilson', 'd3adp00l@gmail.com', '332 3766', 'Sunset Apartments, Unit 404, NY', 2),
(3, 'James Howlett', 'logan@gmail.com', '282 2529', '1407 Graymalkin Lane, Salem Center, NY', 3),
(4, 'Johnathan Storm', 'flam3on@gmail.com', '347 3269', '123 Madeup Street, NY', 4),
(5, 'Wanda Maximoff', 'scarletvvitch@gmail.com', '733 4475', '425 Creative Ave, New Jersey', 5),
(6, 'Peter Parker', 'sp1d3rbitten@gmail.com', '774 3371', '622 Web Road, Manhattan, NY', 6);

SET IDENTITY_INSERT Customers OFF;
SET IDENTITY_INSERT Orders ON;

insert into Orders (OrderId, ItemId, CustomerId, StartDate, EndDate, OrderTotal, Status) values
(1, 1, 1, '2/20/2021 03:00', '2/21/2021 00:00', 480, 'Complete'),
(2, 2, 2, '2/24/2021 05:00', '3/15/2021 00:00', 75, 'Pending'),
(3, 3, 3, '2/20/2021 03:00', '3/10/2021 00:00', 620, 'Complete'),
(4, 2, 4, '2/22/2021 01:00', '2/22/2021 04:00', 30, 'Complete'),
(5, 4, 2, '2/25/2021 00:00', '2/28/2021 00:00', 120, 'Complete'),
(6, 3, 1, '2/25/2021 04:00', '3/15/2021 00:00', 640, 'Pending');

SET IDENTITY_INSERT Orders OFF;

