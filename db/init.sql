use master;
go

-- delete db if exists
if  db_id('SharedWorkspace') is not null
    set noexec on; -- don't execute rest of commands
go

-- create db
create database SharedWorkspace;
go

-- switch to db
use SharedWorkspace;

-- create tables

CREATE TABLE Users (
  id INT PRIMARY KEY IDENTITY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) DEFAULT NULL UNIQUE,
  phone VARCHAR(100) DEFAULT NULL,
  type VARCHAR(20) NOT NULL,
  password VARCHAR(150) NOT NULL,
  sessions VARCHAR(500) DEFAULT NULL
);

CREATE TABLE Properties (
  id INT PRIMARY KEY IDENTITY,
  ownerid INT REFERENCES Users (id) on delete cascade,
  title VARCHAR(150),
  address VARCHAR(200) NOT NULL,
  squareft DECIMAL(10,2) NOT NULL,
  garage BIT NOT NULL,
  publictransportation BIT NOT NULL,
  listed BIT NOT NULL DEFAULT 1
);

CREATE TABLE WorkspaceCategories (
  id INT PRIMARY KEY IDENTITY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Workspaces (
  id INT PRIMARY KEY IDENTITY,
  propertyid INT REFERENCES Properties (id) on delete cascade,
  categoryid INT REFERENCES WorkspaceCategories (id),
  title VARCHAR(150),
  capacity INT NOT NULL,
  smoking BIT NOT NULL,
  available DATE,
  term VARCHAR(10) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  renterid INT REFERENCES Users (id),
  listed BIT NOT NULL DEFAULT 1
);

insert into WorkspaceCategories (name) values
('Meeting Room'),
('Private Office Room'),
('Desk');