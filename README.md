# BankATM-Backend

Este proyecto fue inicializado con npm, utiliza el framework Express, el ORM Prisma y una base de datos en MySQL.

Simula el backend de un banco junto son su base de datos para poder realizar 4 operaciones principales:

- Realizar depósitos o pagar el corte mensual, dependiendo de si se ingreso en el cliente con una tarjeta de crédito o débito.
- Retirar dinero.
- Hacer transferecias.
- Consultar el saldo actual.

Más adelante se encontran los scripts para poder crear la base de datos.

## Scripts Disponibles y configuraciones

Después de ejecutar "npm init" para instalar las dependencias del proyecto, cree el siguiente archivo .env en la raíz del proyecto:

```
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="mysql://{MYSQL_USER}:{PASSWORD_OF_USER}@localhost:{PORT}/bank?schema=public"
```

Donde `MYSQL_USER` es el usuario de tu servicio de MySQL, `PASSWORD_OF_USER` la contraseña para ese usuario y `PORT` el puerto donde se esta ejecutando el servicio, que por defecto en MySQL es 3306.

`localhost` es donde por defecto se ejecuta el servicio de MySQL, si tu los tienes iniciado en otro lado, cambia la información.

Crea la base de datos de MySQL en tu PC.

Ejecuta el comando: `npx prisma db pull`, Prisma leera tu base de datos, para añadir los modelos de las tabals al archivo ./prisma/scheme.prisma

Ahora ejectuta el comando: `npx prisma generate`.

Esto permitira a el ORM Prisma leer los modelos de la tablas que corresponde con las de la base de datos en MySQL, lo generamos con el comando pasado.

Ahora podra ejectuar los siguientes Scripts:

### `npm start`

Para inicializar el proyecto junto con "nodemon", por defecto, se usa el puerto 6969, sientase libre cambiar esto, solo tenga en cuenta que si quiere probar el proyecto junto con el cliente [BankATM-App](https://github.com/EA-Gadgeter/BankATM-App), app que simula un ATM hecha con React, tiene que cambiar el puerto a usar en los servicios.

## Descripción de los Endpoints

Los status que no se especifican en la respuesta, son 200.

### loginUser (POST /login)

Es el endpoint que se utiliza para la autentificación.

Recibe el número de tarjeta y el NIP en el request:

```json
{
    cardNumber: String,
    NIP: String,
}
```

y se encarga de comprobar en la base de datos si el usuario existe para dejarlo entrar.

Devuelve en el response segun sea el caso:

- Si la tarjeta no existe en la base de datos, o sí, pero el NIP ingresado no es el correspondiente

```json
{
    shouldLogin: false,
}
```

- Si se encontró la tarjeta y el NIP ingresado es el correcto

```json
{
    shouldLogin: true,
    idCuenta: String,
    tipoTarjeta: String,
}
```

### getUserData (POST /menu)

Se encarga de obtener la información necesaria que ocupa el cliente de la base de datos.

Recibe el número de tarjeta y el ID de la cuenta al que pertenece la tarjeta en el request:

```json
{
    cardNumber: String,
    idAccount: String,
}
```

Devuelve en el response según sea el caso:

- Si por alguna razón la información no se encontró:

```json
{
    status: 204
    dataFounded: false,
}
```

- La información se encontró:

```json
{
    fonds: Number,
    name: String,
    cardDateEnd: String,
    dataFounded: true,
}
```

### withdrawChange (PUT /withdraw)

Se encarga de actualizar en la base de datos los fondos que el usuario quiere retirar.

Recibe el ID de la cuenta y los fondos a retirar en el request:

```json
{
    idAccount: String,
    restFonds: String,
}
```

Devuelve en el response según sea el caso:

- Si por alguna razón el usuario no se encontró:

```json
{
    status: 204
    dataFounded: false,
}
```

- Si los fondos a retirar superan los fondos en la cuenta del usuario:

```json
{
    withdrawSuccesful: false,
    validMoney: false,
}
```

- Si no se pudo actualizar la información en la base de datos:

```json
{
    withdrawSuccesful: false,
    validMoney: true,
}
```

- Si se actualizo con exito la información en la base de datos:

```json
{
    withdrawSuccesful: true,
    validMoney: true,
}
```

### cardExists (POST /transfer)

Nos permite verificar si una tarjeta existe en la base de datos.

Recibe el número de tarjeta en el request:

```json
{
    cardNumber: String,
}
```

Devuelve en el response según sea el caso:

- Si la tarjeta no existe:

```json
{
    dataFounded: false,
}
```

- Si la tarjeta existe:

```json
{
    idAccountToAdd: String,
    dataFounded: true,
}
```

### transferFonds (PUT /transfer)

Se encarga de actualizar en la base de datos los fondos de lo usuarios involucrados en la transferencia.

Recibe el ID de la cuenta que transfiere, el ID de la cuenta a transferir y los fondos a transferir en el request:

```json
{
    transferFonds: String, 
    idAccount: String, 
    idAccountToAdd: String,
}
```

Devuelve en el response según sea el caso:

- Algunos de los usuarios no fue encontrado:

```json
{
    status: 204
    dataFounded: false,
}
```

- Si los fondos a transferir superan los fondos en la cuenta del usuario:

```json
{
    transferSuccesful: false,
    validMoney: false,
}
```

- Si no se pudo actualizar la información en la base de datos:

```json
{
    transferSuccesful: false,
    validMoney: true,
}
```

- Si se actualizo con exito la información en la base de datos:

```json
{
    transferSuccesful: true,
    validMoney: true,
}
```

### depPayFonds (PUT /dep-fonds)

Se encarga de añadir fondos en la cuenta del usuario si la tarjeta es de débito, o de abonar fondos al corte mensual si la tarjeta es de crédito.

Recibe el ID de la cuenta, los fondos y el tipo de tarjeta en el request:

```json
{
    depPayFonds: String, 
    idAccount: String, 
    cardType: String,
}
```

Si el usuario no se encuentra, siempre devuelve en el response:

```json
{
    status: 204
    dataFounded: false,
}
```

Si la tarjeta es de débito, devuleve según sea el caso:

- Si no se pudo actualizar la información en la base de datos:

```json
{
    depPaySuccesful: false,
}
```

- Si se actualizo con exito la información en la base de datos:

```json
{
    depPaySuccesful: true,
}
```

Si la tarjeta es de crédito, devuleve según sea el caso:

- Si los fondos a abonar del corte mensual superan los fondos en la cuenta del usuario:

```json
{
    depPaySuccesful: false,
    validMoney: false,
}
```

- Si el usuario no debe nada para el corte mensual:

```json
{
    depPaySuccesful: true,
    validMoney: true,
    noToPayFonds: true,
}
```

- Si no se pudo actualizar la información en la base de datos:

```json
{
    depPaySuccesful: false,
    validMoney: true,
}
```

- Si se actualizo con exito la información en la base de datos:

```json
{
    depPaySuccesful: true,
    validMoney: true,
    newUserFonds: Number,
}
```

## Scripts para crear la base de datos con MYSQL

El siguiente es el DDL, lo que crea las tablas y las relaciones entre ellas:

```sql
create database bank;
use bank;

create table Cliente
(
    id_usuario char(10)    not null,
    nombre    varchar(50) not null,
    apellido  varchar(50) not null,
    direccion varchar(50) not null,
    constraint id_usuario
        primary key (id_usuario)
)
    collate = utf8mb4_unicode_ci;

create table Cuenta
(
    id_cuenta    char(10)    not null,
    fondos       float(6, 2) not null,
    id_usuario   char(10)    not null,
    pago_mensual float(6, 2) null,
    constraint id_cuenta
        primary key (id_cuenta),
    constraint id_usuario
        foreign key (id_usuario) references Cliente (id_usuario)
)
    collate = utf8mb4_unicode_ci;

create table Tarjeta
(
    num_tarjeta       char(16)           not null,
    fecha_vencimiento date               not null,
    id_cuenta         char(10)           not null,
    NIP               char(4)            not null,
    tipo_tarjeta      varchar(10)        not null,
    bloqueada         bool default false not null,
    constraint num_tarjeta
        primary key (num_tarjeta),
    constraint id_cuenta
        foreign key (id_cuenta) references Cuenta (id_cuenta)
)
    collate = utf8mb4_unicode_ci;
```

Aquí tienes unos datos para probar el backend:

```sql
insert into Cliente values ('0123456789', 'Emiliano', 'Acevedo', 'Heroes 1810');
insert into Cliente values ('9876543210', 'Sebastian', 'Jacome', 'Mixcoac 15');

insert into Cuenta values ('8594501890', 500.00, '0123456789', null);
insert into Cuenta values ('6596801812', 500.00, '9876543210', 00.00);

insert into Tarjeta values('1515515115155151', '2025-10-01', '8594501890', '1234', 'debito', false);
insert into Tarjeta values('1313313113133131', '2028-08-01', '6596801812', '4321', 'debito', false);
insert into Tarjeta values('1414414114144141', '2030-09-01', '6596801812', '4123', 'credito', false);
```
