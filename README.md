# BankATM-Backend

Este proyecto fue inicializado con npm, utiliza el framework Express, el ORM Prisma y una base de datos en MySQL.

Simula el backend de un banco junto son su base de datos para poder realizar 4 operaciones principales:

- Realizar depósitos o pagar el corte mensual, dependiendo de si se ingresó en el cliente con una tarjeta de crédito o débito.
- Retirar dinero.
- Hacer transferecias.
- Consultar el saldo actual.

Más adelante se encontran los scripts para poder crear la base de datos.

## Scripts Disponibles y configuraciones

Después de ejecutar "npm init" para instalar las dependencias del proyecto, crea el siguiente archivo .env en la raíz del proyecto:

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

Ejecuta el comando: `npx prisma db pull`, Prisma leera tu base de datos, para añadir los modelos de las tablas al archivo ./prisma/scheme.prisma

Ahora ejectuta el comando: `npx prisma generate`.

Esto permitira a el ORM Prisma leer los modelos de la tablas que corresponde con las de la base de datos en MySQL, lo generamos con el comando pasado.

Ahora podra ejectuar los siguientes Scripts:

### `npm start`

Para inicializar el proyecto junto con "nodemon", por defecto, se usa el puerto 6969, sientase libre cambiar esto, solo tenga en cuenta que si quiere probar el proyecto junto con el cliente [BankATM-App](https://github.com/EA-Gadgeter/BankATM-App), app que simula un ATM hecha con React, tiene que cambiar el puerto a usar en los servicios.

## Descripción de los Endpoints

Los status que no se especifican en la respuesta, son 200.

Se creo un usuario en específico que es con el que se conecta el backend para realizar toda la lógica. Se llama "backend_user", y tiene los siguientes permisos:

![backend_user Bank](https://d.img.vision/personal-project-images/backend_user.png "Esquema backend_user")

### loginUser (POST /login)

Es el endpoint que se utiliza para la autentificación.

Recibe el número de tarjeta y el NIP en el request:

```json
{
    "cardNumber": "String",
    "NIP": "String",
}
```

y se encarga de comprobar en la base de datos si el usuario existe para dejarlo entrar.

Devuelve en el response según sea el caso:

- Si la tarjeta no existe en la base de datos:

```json
{
    "shouldLogin": false,
}
```

- Si se encontró la tarjeta y el NIP ingresado es correcto, pero la tarjeta esta bloqueada:

```json
{
    "shouldLogin": false,
    "cardBlocked": true,
}
```

- Si se encontró la tarjeta pero el NIP ingrsado es incorrecto:

```json
{
    "shouldLogin": false,
    "badInfo": true,
}
```

- Si se encontró la tarjeta y el NIP ingresado es el correcto:

```json
{
    "shouldLogin": true,
    "idCuenta": "String",
    "tipoTarjeta": "String",
}
```

### getUserData (POST /menu)

Se encarga de obtener la información necesaria que ocupa el cliente de la base de datos.

Recibe el número de tarjeta y el ID de la cuenta al que pertenece la tarjeta en el request:

```json
{
    "cardNumber": "String",
    "idAccount": "String",
}
```

Devuelve en el response según sea el caso:

- Si por alguna razón la información no se encontró:

```json
{
    "status": 204
    "dataFounded": false,
}
```

- La información se encontró:

```json
{
    "fonds": "Number",
    "name": "String",
    "cardDateEnd": "String",
    "dataFounded": true,
}
```

### withdrawChange (PUT /withdraw)

Se encarga de actualizar en la base de datos los fondos que el usuario quiere retirar.

Recibe el ID de la cuenta y los fondos a retirar en el request:

```json
{
    "idAccount": "String",
    "restFonds": "String",
}
```

Devuelve en el response según sea el caso:

- Si por alguna razón el usuario no se encontró:

```json
{
    "status": 204
    "dataFounded": false,
}
```

- Si los fondos a retirar superan los fondos en la cuenta del usuario:

```json
{
    "withdrawSuccesful": false,
    "validMoney": false,
}
```

- Si no se pudo actualizar la información en la base de datos:

```json
{
    "withdrawSuccesful": false,
    "validMoney": true,
}
```

- Si se actualizó con éxito la información en la base de datos:

```json
{
    "withdrawSuccesful": true,
    "validMoney": true,
}
```

### cardExists (POST /transfer)

Nos permite verificar si una tarjeta existe en la base de datos.

Recibe el número de tarjeta en el request:

```json
{
    "cardNumber": "String",
}
```

Devuelve en el response según sea el caso:

- Si la tarjeta no existe:

```json
{
    "dataFounded": false,
}
```

- Si la tarjeta existe:

```json
{
    "idAccountToAdd": "String",
    "dataFounded": true,
}
```

### transferFonds (PUT /transfer)

Se encarga de actualizar en la base de datos los fondos de lo usuarios involucrados en la transferencia.

Recibe el ID de la cuenta que transfiere, el ID de la cuenta a transferir y los fondos a transferir en el request:

```json
{
    "transferFonds": "String", 
    "idAccount": "String", 
    "idAccountToAdd": "String",
}
```

Devuelve en el response según sea el caso:

- Algunos de los usuarios no fue encontrado:

```json
{
    "status": 204
    "dataFounded": false,
}
```

- Si los fondos a transferir superan los fondos en la cuenta del usuario:

```json
{
    "transferSuccesful": false,
    "validMoney": false,
}
```

- Si no se pudo actualizar la información en la base de datos:

```json
{
    "transferSuccesful": false,
    "validMoney": true,
}
```

- Si se actualizó con éxito la información en la base de datos:

```json
{
    "transferSuccesful": true,
    "validMoney": true,
}
```

### depPayFonds (PUT /dep-fonds)

Se encarga de añadir fondos en la cuenta del usuario si la tarjeta es de débito, o de abonar fondos al corte mensual si la tarjeta es de crédito.

Recibe el ID de la cuenta, los fondos y el tipo de tarjeta en el request:

```json
{
    "depPayFonds": "String", 
    "idAccount": "String", 
    "cardType": "String",
}
```

Si el usuario no se encuentra, siempre devuelve en el response:

```json
{
    "status": 204
    "dataFounded": false,
}
```

Si la tarjeta es de débito, devuleve según sea el caso:

- Si no se pudo actualizar la información en la base de datos:

```json
{
    "depPaySuccesful": false,
}
```

- Si se actualizó con éxito la información en la base de datos:

```json
{
    "depPaySuccesful": true,
}
```

Si la tarjeta es de crédito, devuleve según sea el caso:

- Si los fondos a abonar del corte mensual superan los fondos en la cuenta del usuario:

```json
{
    "depPaySuccesful": false,
    "validMoney": false,
}
```

- Si el usuario no debe nada para el corte mensual:

```json
{
    "depPaySuccesful": true,
    "validMoney": true,
    "noToPayFonds": true,
}
```

- Si no se pudo actualizar la información en la base de datos:

```json
{
    "depPaySuccesful": false,
    "validMoney": true,
}
```

- Si se actualizó con éxito la información en la base de datos:

```json
{
    "depPaySuccesful": true,
    "validMoney": true,
    "newUserFonds": "Number",
}
```

## Scripts para crear la base de datos con MySQL

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
        on delete cascade
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
        on delete cascade
)
    collate = utf8mb4_unicode_ci;

create table ATM
(
    id_atm    char(20)          not null,
    direccion varchar(50)       not null,
    operando  bool default true not null,
    constraint id_atm
        primary key (id_atm)
)
    collate = utf8mb4_unicode_ci;

create table Transaccion
(
    id_transaccion   char(20)    not null,
    tipo_transaccion varchar(20) not null,
    id_atm           char(20)    null,
    id_cuenta        char(10)    null,
    fecha            datetime    not null,
    estado           varchar(20) not null,
    cambio_fondos    float(6, 2) not null,
    constraint id_transaccion
        primary key (id_transaccion),
    constraint id_atm
        foreign key (id_atm) references ATM (id_atm)
        on delete set null,
    constraint id_cuenta_transaccion
        foreign key (id_cuenta) references Cuenta (id_cuenta)
        on delete set null
)
    collate = utf8mb4_unicode_ci;


```

El siguiente es el DML, que inserta valores en la base de datos para poder probarla:

```sql
insert into Cliente values ('9075551258', 'Susana', 'Hill', '2021 West Burnett Avenue');
insert into Cuenta values ('6798999145', 3053, '9075551258', 570);
insert into Tarjeta values('0072144623883964', '2022-05-19', '6798999145', '3931', 'debito', false);


insert into Tarjeta values('8420538341465889', '2028-03-12', '6798999145', '0967', 'credito', false);


insert into Cliente values ('8936986337', 'Frank', 'Haine', '49 West Street');
insert into Cuenta values ('4554868470', 8414, '8936986337', 1390);
insert into Tarjeta values('5165813605780210', '2016-11-07', '4554868470', '1475', 'debito', false);


insert into Tarjeta values('0125018368865478', '2017-09-19', '4554868470', '2046', 'credito', false);


insert into Cliente values ('1699699450', 'Elizabeth', 'Miller', '2100 Sandy Creek Trail');
insert into Cuenta values ('1519941861', 4173, '1699699450', 1110);
insert into Tarjeta values('6759334645980729', '2018-03-08', '1519941861', '1090', 'debito', false);


insert into Tarjeta values('2055731697474579', '2003-09-27', '1519941861', '4497', 'credito', false);


insert into Cliente values ('4652876035', 'Adam', 'Greenwald', '106 Parker Parkway');
insert into Cuenta values ('0447358176', '2218', '4652876035', null);
insert into Tarjeta values('9007705882985585', '2013-12-26', '0447358176', '5880', 'debito', false);


insert into Cliente values ('2979670457', 'Lillian', 'Hunter', '2237 Northwest 18th Street');
insert into Cuenta values ('3352143355', '9962', '2979670457', null);
insert into Tarjeta values('5919735263845592', '2003-12-18', '3352143355', '6992', 'debito', false);


insert into Cliente values ('9781761108', 'Karen', 'Aleman', '35 Lakewood Circle South');
insert into Cuenta values ('4971368560', 3462, '9781761108', 522);
insert into Tarjeta values('7407529235840930', '2012-09-09', '4971368560', '5585', 'debito', false);


insert into Tarjeta values('3030925109676348', '2012-06-08', '4971368560', '5390', 'credito', false);


insert into Cliente values ('8668072831', 'Deborah', 'Mayes', '218 Durham Park Way');
insert into Cuenta values ('6593161081', '8567', '8668072831', null);
insert into Tarjeta values('7713663014725218', '2028-04-01', '6593161081', '3578', 'debito', false);


insert into Cliente values ('8095579663', 'James', 'Johnson', '12039 West 85th Drive');
insert into Cuenta values ('1386110268', 8879, '8095579663', 809);
insert into Tarjeta values('7179141315517716', '2026-05-20', '1386110268', '1004', 'debito', false);


insert into Tarjeta values('8335725919806853', '2025-05-11', '1386110268', '6263', 'credito', false);


insert into Cliente values ('9541469406', 'Barbara', 'Polland', '301 Willow Way');
insert into Cuenta values ('9659349864', 5145, '9541469406', 1165);
insert into Tarjeta values('9364032192264361', '2020-12-02', '9659349864', '9436', 'debito', false);


insert into Tarjeta values('0038620698266287', '2011-12-24', '9659349864', '7315', 'credito', false);


insert into Cliente values ('6020606862', 'Dwight', 'Martin', '22 Gallatin Street Northeast');
insert into Cuenta values ('1857380504', 4408, '6020606862', 1300);
insert into Tarjeta values('6127133990658368', '2008-05-24', '1857380504', '7826', 'debito', false);


insert into Tarjeta values('9982689910686014', '2021-05-28', '1857380504', '2082', 'credito', false);


insert into Cliente values ('7448954256', 'Ashlee', 'Collins', '4511 Sloat Road');
insert into Cuenta values ('3964532236', '4749', '7448954256', null);
insert into Tarjeta values('0397546431830894', '2030-10-30', '3964532236', '0813', 'debito', false);


insert into Cliente values ('4387524832', 'Vera', 'Lineberry', '6086 Kennedy Drive');
insert into Cuenta values ('6967386514', '3955', '4387524832', null);
insert into Tarjeta values('5589023746053414', '2005-04-28', '6967386514', '5835', 'debito', false);


insert into Cliente values ('9564665234', 'Steven', 'Stalling', '6463 Vrain Street');
insert into Cuenta values ('9330815496', 2762, '9564665234', 1181);
insert into Tarjeta values('7095316087904294', '2012-04-17', '9330815496', '7450', 'debito', false);


insert into Tarjeta values('4151558184567334', '2028-12-06', '9330815496', '6664', 'credito', false);


insert into Cliente values ('7505337621', 'Kathryn', 'Bryant', '120 Wells Avenue');
insert into Cuenta values ('0241812844', 6524, '7505337621', 798);
insert into Tarjeta values('7079800124898396', '2002-11-07', '0241812844', '2516', 'debito', false);


insert into Tarjeta values('1314795587759974', '2010-02-03', '0241812844', '6357', 'credito', false);


insert into Cliente values ('3390822655', 'Bruce', 'Lee', '4039 Pipeline Road');
insert into Cuenta values ('2499487179', 6715, '3390822655', 1120);
insert into Tarjeta values('7787430588593327', '2013-06-30', '2499487179', '8088', 'debito', false);


insert into Tarjeta values('6323933580753751', '2025-11-01', '2499487179', '6250', 'credito', false);


insert into Cliente values ('2429210528', 'Steven', 'Torres', '386 Pratt Road');
insert into Cuenta values ('0789858891', 5616, '2429210528', 1363);
insert into Tarjeta values('0675401916595945', '2004-04-02', '0789858891', '5020', 'debito', false);


insert into Tarjeta values('7502038165861433', '2007-12-14', '0789858891', '3179', 'credito', false);


insert into Cliente values ('7328535086', 'Jackie', 'Wadusky', '2441 Chase Park Drive');
insert into Cuenta values ('5774860689', 5613, '7328535086', 1430);
insert into Tarjeta values('3843026122455710', '2016-06-24', '5774860689', '5294', 'debito', false);


insert into Tarjeta values('5896834840702773', '2019-08-01', '5774860689', '3336', 'credito', false);


insert into Cliente values ('2823291791', 'James', 'Dodd', '111 20th Street');
insert into Cuenta values ('4696618360', '3733', '2823291791', null);
insert into Tarjeta values('4288683998853987', '2024-11-07', '4696618360', '6296', 'debito', false);


insert into Cliente values ('3541331631', 'Charlotte', 'Hardison', '816 East 69th Street');
insert into Cuenta values ('8768741652', '2176', '3541331631', null);
insert into Tarjeta values('8107738693816399', '2025-10-14', '8768741652', '4183', 'debito', false);


insert into Cliente values ('6330526550', 'Amy', 'Medina', '201 Lee Boulevard');
insert into Cuenta values ('5578279771', '7123', '6330526550', null);
insert into Tarjeta values('5023253718974032', '2002-05-20', '5578279771', '5306', 'debito', false);


insert into Cliente values ('4580949232', 'Jason', 'Cochran', '4000 Beth Manor Drive');
insert into Cuenta values ('3735966014', '3644', '4580949232', null);
insert into Tarjeta values('0690578110801871', '2013-03-16', '3735966014', '7201', 'debito', false);


insert into Cliente values ('5326963526', 'Debra', 'Czarnecki', '4981 Shirley Way');
insert into Cuenta values ('5723852478', '8232', '5326963526', null);
insert into Tarjeta values('1083259025571543', '2024-02-15', '5723852478', '2882', 'debito', false);


insert into Cliente values ('2464940184', 'Ronald', 'Larry', '65 Clark Street');
insert into Cuenta values ('3710868867', '5780', '2464940184', null);
insert into Tarjeta values('2306186266342856', '2013-06-22', '3710868867', '6980', 'debito', false);


insert into Cliente values ('1157269023', 'Charles', 'Buzby', '2300 Deer Path Circle');
insert into Cuenta values ('3463053397', 6721, '1157269023', 1194);
insert into Tarjeta values('0699185339391491', '2000-08-06', '3463053397', '4430', 'debito', false);


insert into Tarjeta values('2299259215371414', '2025-05-11', '3463053397', '3129', 'credito', false);


insert into Cliente values ('8271584762', 'Chong', 'Potter', '55 Armory Street');
insert into Cuenta values ('6976619701', '5586', '8271584762', null);
insert into Tarjeta values('2524571489245190', '2001-04-25', '6976619701', '7591', 'debito', false);


insert into Cliente values ('3551345157', 'Jose', 'Hoffman', '6049 Quail Street');
insert into Cuenta values ('4458230888', 5694, '3551345157', 534);
insert into Tarjeta values('5856777678650295', '2012-10-01', '4458230888', '6714', 'debito', false);


insert into Tarjeta values('9033963736155080', '2027-04-27', '4458230888', '8289', 'credito', false);


insert into Cliente values ('7365839079', 'Damian', 'Virtue', '3320 Peterkin Avenue');
insert into Cuenta values ('6168158684', 5261, '7365839079', 1052);
insert into Tarjeta values('8163920469607918', '2026-02-23', '6168158684', '6586', 'debito', false);


insert into Tarjeta values('9677354975348273', '2030-06-29', '6168158684', '3159', 'credito', false);


insert into Cliente values ('5415212225', 'Patrica', 'Castaneda', '1109 East 35th Street');
insert into Cuenta values ('2400804604', 9483, '5415212225', 644);
insert into Tarjeta values('8652093825290250', '2024-04-26', '2400804604', '3801', 'debito', false);


insert into Tarjeta values('9424655622771527', '2007-12-04', '2400804604', '0099', 'credito', false);


insert into Cliente values ('9986647116', 'Dawn', 'Erbst', '7431 Gilbert Road');
insert into Cuenta values ('4568856562', 5409, '9986647116', 1240);
insert into Tarjeta values('0818629731274130', '2001-06-23', '4568856562', '3334', 'debito', false);


insert into Tarjeta values('7795283827309058', '2022-05-01', '4568856562', '1583', 'credito', false);


insert into Cliente values ('1840991331', 'Rebecca', 'Chavez', '1194 Cragmont Avenue');
insert into Cuenta values ('4492385635', 3468, '1840991331', 903);
insert into Tarjeta values('1306554150336171', '2028-10-01', '4492385635', '8898', 'debito', false);


insert into Tarjeta values('7183419748007403', '2016-10-25', '4492385635', '2380', 'credito', false);


insert into Cliente values ('0123456789', 'Emiliano', 'Acevedo', 'Heroes 1810');
insert into Cliente values ('9876543210', 'Sebastian', 'Jacome', 'Mixcoac 15');

insert into Cuenta values ('8594501890', 500.00, '0123456789', null);
insert into Cuenta values ('6596801812', 500.00, '9876543210', 00.00);

insert into Tarjeta values('1515515115155151', '2025-10-01', '8594501890', '1234', 'debito', false);
insert into Tarjeta values('1313313113133131', '2028-08-01', '6596801812', '4321', 'debito', false);
insert into Tarjeta values('1414414114144141', '2030-09-01', '6596801812', '4123', 'credito', false);


insert into ATM values('71336009877586106617', '4907 Roger Drive', true);
insert into ATM values('92914539000527764650', '642 Sagamore Drive', true);
insert into ATM values('35207765647195594596', '1413 G Street', true);
insert into ATM values('42721188558977809475', '5912 North 48th Avenue', true);
insert into ATM values('95170271950572984043', '1054 Overton Lea Road', true);
insert into ATM values('65582532920323455437', '2107 Elfen Glen', true);
insert into ATM values('85085107007553978937', '14347 Corvallis Street', true);
insert into ATM values('80027533746489356720', '7645 Marshall Street', true);
insert into ATM values('76685779729524345977', '232 Maine Avenue', true);
insert into ATM values('75351788406338567030', '325 Irwin Street', true);
insert into ATM values('54785439829766890299', '304 Wilmington Island Road', true);
insert into ATM values('29467844598261164107', '150 Meadowview Street', true);
insert into ATM values('80672946609953887070', '5434 West Beck Lane', true);
insert into ATM values('04802599999887607291', '231 South Kimbrel Avenue', true);
insert into ATM values('75054770778040530419', '7407 North 75th Drive', true);
insert into ATM values('68750167932510438862', '3784 Milky Way Drive', true);
insert into ATM values('53232409464455583089', '5144 Cattail Court', true);
insert into ATM values('20769517157278737375', '113 Hammarlee Road', true);
insert into ATM values('36275620170890052781', '923 K Street Northeast', true);
insert into ATM values('29765406193848750379', '4 Chamois Court', true);
insert into ATM values('05208036525310763089', '409 Snook Lane', true);
insert into ATM values('63943104103416090385', '3469 North Par Court', true);
insert into ATM values('48797515376428485118', 'Biloxi Crossing', true);
insert into ATM values('93804401711000803737', '1254 Muldoon Road', true);
insert into ATM values('39399230180407691112', '2100 North Leverett Avenue', true);
insert into ATM values('93016848824542476842', '60 Bagley Street', true);
insert into ATM values('26741496366917673863', '5929 West Via Montoya Drive', true);
insert into ATM values('68207894731773396984', '921 5th Street Southeast', true);
insert into ATM values('54519644470857099146', '39 Tania Drive', true);
insert into ATM values('33556695754290306432', '149 Lenox Street', true);

```

## Esquema y lógica de la base de datos

![Esquema Bank](https://d.img.vision/personal-project-images/EsquemaBaseDatos.png "Esquema Bank")

### Cliente

Contiene la información básica del cliente, como su nombre, apellido y dirección.

La llave primaria es un char(10) compuesta por números del 0 al 9, se usó char en lugar de varchar para usar la memoria de manera efectiva, seguimos esta misma idea para las llaves primarias del resto de las tablas y otros campos en general.

### ATM

Contiene la dirección del cajero, así como un bool, que indica si el cajero esta operando o no.

El valor por defecto del bool que determina si el cajero opera o no es true.

La llave primaria es un char(20).

### Cuenta

Contiene los fondos y pago mensual del corte como un float (6, 2), pensando que el máximo valor es 999,999.99, seguimos esta misma idea para el resto tablas que manejan dinero.

La llave primaria es un char(10).

El valor por defecto del pago mensual del corte es null, ya que por defecto en la lógica de negocios de un banco, un usuario no tiene una tarjeta de crédito.

Contiene una llave foránea, que es el id_usuario del cliente, donde la relación es que un Cliente puede tener varias Cuentas, pero una Cuenta solo puede pertenecer a un Cliente. Al borrarse la referencia del Cliente, se usa un `on delete cascade`.

### Tarjeta

Contiene la fecha de vencimiento de la tarjeta, el NIP de la tarjeta, el tipo de tarjeta, debito o credito, y un bool que nos indica si la tarjeta esta bloqueada o no.

La llave primaria es el número de la tarjeta, que es un char(16).

El valor por defecto del bool que determina si la tarjeta esta bloqueada o no es false.

Contiene una llave foránea, que es el id de la cuenta, donde la relación es que una Cuenta puede tener 2 tarjetas, pero una tarjeta solo puede pertenecer a una Cuenta. Al borrarse la referencia de la Cuenta, se usa un `on delete cascade`.

### Transaccion

Contiene la fecha como un datetime, el estado de la transacción y como cambiaron los fondos en la transacción.

La llave primaria es un char(20).

Contiene 2 llaves foráneas:

- El id del ATM donde se realizó la transacción, donde la relación es que es que un ATM puede aparecer en varias transacciones, pero una transacción solo ocurre en un ATM. Al borrarse la referencia del ATM, se usa un `on delete set null`.

- El id de la cuenta de donde se hizo la transacción, donde la relación es que una cuenta puede realizar múltiples transacciones, pero una transacción puede solo pertenecer a una sola cuenta. Al borrarse la referencia de la Cuenta, se usa un `on delete set null`.

## Programa de mantenimiento

Si se ingresa un NIP incorrecto para una tarjeta existente 3 veces, esta se bloqueara. Para desbloquearlas, se realizo un programa de mantenimiento aparte en Python, que desbloquea las tarjetas.

Se creó un usuario en específico para el programa. Se llama "maintenance_user", y tiene los siguientes permisos:

![maintenance_user Bank](https://d.img.vision/personal-project-images/maintance_userPrueba.png "maintenance_user backend_user")

### Código Programa de mantemiento

```python
import mysql.connector


user = input('Introduzca el usuario de mantenimiento: ') #maintenance_user
password = input('Introduzca la contraseña: ') #impostor

try:
    connection = mysql.connector.connect(
        host = 'database-bank.cc2yxugnk1fr.us-east-2.rds.amazonaws.com',
        user = user,
        password = password,
        port = 3306,
        database = 'bank')
    
    
    
    cursor = connection.cursor(buffered=True)
    
    band = True
    while band:
        print('Seleccione la opcion deseada: \n' + 
            '1. Desbloquear Tarjeta\n' +
            '2. Salir\n')
        ans = int(input('Escoja una de las anteriores: '))
        match ans:
            case 1:
                tarjeta = str(input('Seleccione la tarjeta bloqueada que quiere desbloquear: '))
                query = """
                        SELECT * FROM Tarjeta
                """
                result = cursor.execute(query)
                query_results = cursor.fetchall()
                for x in range(len(query_results)):
                    if(tarjeta == query_results[x][0]):
                        if(query_results[x][5]==0):
                            print('Esta cuenta no esta bloqueada')
                        else:
                            query = f"""UPDATE Tarjeta SET bloqueada = 0 WHERE num_tarjeta = {tarjeta}"""
                            desbloqueada = cursor.execute(query)
                            connection.commit()
                            print('Se ha actualizado correctamente')
            case 2:
                band = False
            case _:
                print('Esa opcion no existe') 
except mysql.connector.Error as error:
    print('No se pudo hacer la conexión')
    print('El usuario y la contraseña han sido incorrectos')
finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
        print("MySQL connection is closed")
    
```
