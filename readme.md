## Cómo correr el código

### Hacer esto solo una vez

Dentro del directorio donde se clonó el repositorio:

1. Correr el comando `npm i`.
1. `cp .env.temp .env` y editar `.env` con las credenciales necesarias para acceder al sitio
   <https://www.seminuevos.com>.

Para correr el código a partir de ahora es con el comando `npm run start`.

## Hacer llamadas a la API

El único endpoint disponible hasta el momento está en `POST /seminuevo`.

[![Ejemplo de llamada al endpoint para crear una publicación.](https://i.postimg.cc/CLcymbyv/photo-2022-09-08-21-05-43.jpg)](https://postimg.cc/JGHdhDzJ)

El `body` debe ser un `JSON` con los siguientes valores:

```typescript
{
  price: number, // El precio del auto, con un máximo de 2 decimales de precisión.
  description: string, // La descripción del auto, obligatoria, mínimo un carácter.
}
```

Para acceder a la screenshot que devuelve, se debe concatenar el valor de `ssName` al final de
`http://localhost:3026/screenshots/`, por ejemplo `http://localhost:3026/screenshots/1662687994748.png`.

Como la publicación a veces puede tardar en aparecer en la base de datos de <https://seminuevos.com>, la captura de
pantalla puede mostrar un 404, pero se le puede dar seguimiento a la publicación desde el otro dato que retorna
`publicationURL`.
