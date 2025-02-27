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
                    as: 'categoria',
                    attributes: ['nombreCategoria'],
                },
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['nombreUsuario']
                }
            ]
        });

        if (gastos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron gastos para este usuario.' });
        }

        const gastosConCategoria = gastos.map(gasto => ({
            ...gasto.toJSON(),
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
        // Validar datos básicos
        if (!cantidadGasto) {
            return res.status(400).json({ message: 'Debes introducir un monto' });
        }

        if (isNaN(Number(cantidadGasto)) || Number(cantidadGasto) <= 0) {
            return res.status(400).json({ message: 'La cantidad debe ser un número válido mayor a 0' });
        }

        if (!idUsuario || !idCategoria) {
            return res.status(400).json({ message: 'Se requieren los id de usuario y categoría' });
        }

        // Validar que el usuario exista
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Validar que la categoría exista y pertenezca al usuario
        const categoria = await Categoria.findOne({
            where: { idCategoria, idUsuario },
        });
        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada o no pertenece al usuario' });
        }

        // Crear el gasto
        const nuevoGasto = await Gasto.create({
            cantidadGasto,
            idUsuario,
            idCategoria,
        });

        // Retornar respuesta con detalles
        return res.status(201).json({
            message: 'Gasto creado exitosamente',
            gasto: {
                idGasto: nuevoGasto.idGasto,
                cantidadGasto: nuevoGasto.cantidadGasto,
                categoria: categoria.nombreCategoria,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el gasto' });
    }
};

export const actualizarGasto = async (req, res) => {
    const { idUsuario, idCategoria, idGasto } = req.params;
    const { cantidadGasto } = req.body; // Recibimos la cantidad del cuerpo de la solicitud

    try {
        
        if (!idUsuario || !idCategoria || !idGasto) {
            return res.status(400).json({ message: 'Los parámetros idUsuario, idCategoria e idGasto son obligatorios.' });
        }

        const categoria = await Categoria.findOne({
            where: {
                idCategoria,
                idUsuario
            }
        });

        if (!categoria) {
            return res.status(404).json({ message: 'La categoría no existe o no pertenece a este usuario.' });
        }

        const gasto = await Gasto.findOne({
            where: {
                idGasto,
                idUsuario
            }
        });

        if (!gasto) {
            return res.status(404).json({ message: 'El gasto no existe o no pertenece a este usuario.' });
        }

        if (idCategoria) {
            gasto.idCategoria = idCategoria;
        }

        if (cantidadGasto) {
            if (isNaN(cantidadGasto) || cantidadGasto <= 0) {
                return res.status(400).json({ message: 'La cantidad del gasto debe ser un número válido mayor que 0.' });
            }
            gasto.cantidadGasto = cantidadGasto;
        }

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