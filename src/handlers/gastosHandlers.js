import { Gasto } from "../models/gastos.js";
import { Usuario } from "../models/usuarios.js";
import { Categoria } from "../models/categorias.js"

const regexNumeros = /^[0-9]+$/;

export const obtenerGastos = async (req, res) => {
    const { idUsuario } = req.params;

    if (!idUsuario) {
        return res.status(400).json({ message: 'El idUsuario es obligatorio.' });
    }

    try {
        const gastos = await Gasto.findAll({
            where: { idUsuario },
            include: [
                {
                    model: Categoria,
                    as: 'categoria', // Este debe coincidir con el alias de la relación en el modelo
                    attributes: ['nombreCategoria'], // Solo incluimos el campo 'nombre' de la categoría
                }
            ]
        });

        if (gastos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron gastos para este usuario.' });
        }

        const gastosConCategoria = gastos.map(gasto => ({
            ...gasto.toJSON(),
            nombreCategoria: gasto.categoria ? gasto.categoria.nombreCategoria : 'Sin categoría',
        }));

        return res.status(200).json(gastosConCategoria);

    } catch (error) {
        console.log('Error al obtener gastos', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const crearGasto = async (req, res) => {
    const { idUsuario, idCategoria, cantidadGasto } = req.body;

    try {
        if (!cantidadGasto) {
            return res.status(400).json({ message: 'Debe tener una cantidad' });
        }

        if (!regexNumeros.test(cantidadGasto)) {
            return res.status(400).json({ message: 'Solo se permiten numeros' });
        }

        if (!idUsuario || !idCategoria) {
            return res.status(400).json({ message: 'Se requieren los id de usuario y categoria' });
        }

        const newGasto = await Gasto.create({
            cantidadGasto,
            idUsuario,
            idCategoria
        });

        if (!newGasto) {
            return res.status(500).json({ message: 'Error al crear el gasto en la base de datos' });
        }

        const gastoConDetalles = await Gasto.findOne({
            where: { idGasto: newGasto.idGasto },
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['nombreUsuario']
                },
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombreCategoria']
                }
            ]
        });

        if (!gastoConDetalles) {
            return res.status(404).json({ message: 'Gasto no encontrado después de la creación' });
        }

        if (!gastoConDetalles.usuario || !gastoConDetalles.categoria) {
            return res.status(500).json({ message: 'Error al obtener los detalles del usuario o categoría' });
        }

        return res.status(201).json({
            message: 'Gasto creado exitosamente',
            gasto: {
                cantidadGasto,
                usuario: gastoConDetalles.usuario.nombreUsuario,
                categoria: gastoConDetalles.categoria.nombreCategoria
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el gasto' });
    }
};

export const actualizarGasto = async (req, res) => {
    const { idUsuario, idCategoria, idGasto } = req.params;
    const { cantidadGasto } = req.body; // Recibimos la cantidad del cuerpo de la solicitud

    if (!idUsuario || !idCategoria || !idGasto) {
        return res.status(400).json({ message: 'Los parámetros idUsuario, idCategoria e idGasto son obligatorios.' });
    }

    try {
        // Verificar si la categoría existe y pertenece al usuario
        const categoria = await Categoria.findOne({
            where: {
                idCategoria,
                idUsuario
            }
        });

        if (!categoria) {
            return res.status(404).json({ message: 'La categoría no existe o no pertenece a este usuario.' });
        }

        // Verificar si el gasto existe
        const gasto = await Gasto.findOne({
            where: {
                idGasto,
                idUsuario
            }
        });

        if (!gasto) {
            return res.status(404).json({ message: 'El gasto no existe o no pertenece a este usuario.' });
        }

        // Actualizar la categoría del gasto si es necesario
        if (idCategoria) {
            gasto.idCategoria = idCategoria; // Asignar la nueva categoría al gasto
        }

        // Validar y actualizar la cantidad del gasto si se proporciona
        if (cantidadGasto) {
            if (isNaN(cantidadGasto) || cantidadGasto <= 0) {
                return res.status(400).json({ message: 'La cantidad del gasto debe ser un número válido mayor que 0.' });
            }
            gasto.cantidadGasto = cantidadGasto; // Actualizar la cantidad del gasto
        }

        // Guardar los cambios
        await gasto.save();

        return res.status(200).json({ message: 'Gasto actualizado exitosamente', gasto });

    } catch (error) {
        console.log('Error al actualizar gasto', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const eliminarGasto = async (req, res) => {
    const { idUsuario, idGasto } = req.params;

    try {
        if(!idUsuario || !idGasto){
            return res.status(400).json({ message: "El idUsuario y idCategoria son obligatorios"})
        }
    
    const gasto = await Gasto.findOne({
        where: {
            idGasto: idGasto,
            idUsuario: idUsuario
        }
    });

    if(!gasto){
        return res.status(404).json({ message: "Gasto no encontrado"})
    }

    await gasto.destroy();

    return res.status(200).json({ message: "Gasto eliminado correctamente"})
    } catch (error) {
        console.log('Error al eliminar gasto', error);
        return res.status(500).json({ message: "Error interno del servidor"})
    }
}