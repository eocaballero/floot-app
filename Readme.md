# Fiesta Nacional de la Familia Piemontesa Comida Festival App
        
Necesito construir una aplicacion web que sera utilizada por el publico asistente a una fiesta patronal organizada por la municipalidad de una localidad de Cordoba, el sitio se utilizara casi exclusivamente desde dispositivos moviles. Quisiera un diseño alegre y minimalista sin demasiada carga visual. La aplicacion estará destinada solamente a la venta de comida dentro del festival, los diferentes platos que se ofrecen esta organizados por puestos. 
Debe contar con las siguientes secciones:
- Acceso publico
  - Una landing page con informacion general del fiesta y de la aplicacion 
  - Un login con google y facebook, solo necesitamos extraer el nombre y mail del usuario cuando inicien session
- Acceso autenticado
  - Tienda: listado de los productos que se venden, con filtro por puesto y por nombre y con posibilidad de ir agregando al carrito. Cada item de product tendra Nombre, Puesto al que pertenece y precio
  - Carrito de compras: aqui veremos los productos que se han agregado para comprar, y se permitira confirmar la compra 
  - Mis productos: aqui el usuario vera los productos que tiene disponibles para retirar 
  - Monedero: el usuario vera el saldo actual que tiene disponible para gastar, los movimientos de saldo y podra cargar saldo a su monedero mediante MercadoPago
  - Mi QR: cuando el usuario se acerque a los puestos de venta a retirar alguno de los productos que ha adquirido Debera mostrar un codigo QR que se generara aleatoriamente cada vez que sea necesario y tendra una validez de 60 Segundos
Para tener en cuenta en el diseño, los colores principales de la identidad del evento son el verde lima y el rojo y con un poco de menos importancia el Azul

Made with Floot.

# Instructions

For security reasons, the `env.json` file is not pre-populated — you will need to generate or retrieve the values yourself.  

For **JWT secrets**, generate a value with:  

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste the generated value into the appropriate field.  

For the **Floot Database**, download your database content as a pg_dump from the cog icon in the database view (right pane -> data -> floot data base -> cog icon on the left of the name), upload it to your own PostgreSQL database, and then fill in the connection string value.  

**Note:** Floot OAuth will not work in self-hosted environments.  

For other external services, retrieve your API keys and fill in the corresponding values.  

Once everything is configured, you can build and start the service with:  

```
npm install -g pnpm
pnpm install
pnpm vite build
pnpm tsx server.ts
```
