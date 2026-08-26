# Funcionamiento y lógica funcional

## 1. Entrada a la aplicación

1. Usuario abre `cumplimiento.tibox.cl`.
2. Si no existe sesión válida, se muestra login.
3. El proveedor autentica al usuario.
4. La aplicación consulta sus memberships.
5. Si tiene una organización, entra directamente.
6. Si tiene varias, selecciona organización.
7. Si es usuario TIBOX de plataforma, puede acceder a la consola global según rol.

Ninguna organización se determina solo por dominio de correo.

## 2. Contexto de organización

Toda vista funcional opera con una organización activa.

```text
session.user
  ↓
membership válida
  ↓
organization activa
  ↓
permiso
  ↓
recurso
```

Si un usuario altera el slug/ID de URL a otra organización, RLS debe impedir cualquier lectura o escritura.

## 3. Alta de cliente

Flujo propuesto:

1. TIBOX crea organización.
2. Se configuran nombre, RUT, timezone y opciones.
3. Se activa marco Ley 21.719.
4. El sistema instancia el catálogo vigente de controles/obligaciones.
5. Se invita al primer `org_admin`.
6. Cliente completa usuarios/responsables.
7. Se inicia diagnóstico/matriz.
8. Todo el alta queda auditado.

No copiar manualmente registros desde otro cliente.

## 4. Dashboard

El dashboard no almacena números manualmente. Calcula indicadores desde datos fuente o usa vistas/materializaciones controladas.

Mínimo:

- avance global;
- obligaciones por estado;
- acciones vencidas;
- evidencias por vencer;
- controles de riesgo alto;
- actividad reciente permitida.

La fórmula de score debe venir de una definición funcional versionada.

## 5. Matriz de cumplimiento

Cada control tiene:

- marco/módulo;
- referencia legal;
- estado;
- prioridad;
- responsable;
- revisor;
- fecha objetivo;
- observaciones;
- evidencias;
- acciones;
- historial.

Cambio de estado:

1. validar permiso;
2. validar transición si existen reglas;
3. actualizar control;
4. registrar auditoría;
5. recalcular/invalidar resumen;
6. notificar solo si existe regla configurada.

## 6. Assessment de seguridad

Usa el mismo motor de controles con atributos técnicos adicionales.

Vistas:

- por categoría;
- por nivel de madurez;
- por riesgo;
- por estado;
- pendientes;
- recomendaciones.

Un assessment técnico no debe alterar el score legal hasta que negocio defina cómo se relacionan.

## 7. Plan de acción

Una brecha puede tener una o varias acciones.

Cada acción:

- descripción;
- prioridad;
- responsable;
- vencimiento;
- estado;
- comentarios;
- relación opcional a control;
- historial.

Vencimientos se calculan por timezone de organización para UX, pero se almacenan de forma consistente.

## 8. Evidencias

Flujo abstracto:

1. usuario selecciona control;
2. pulsa `Adjuntar evidencia`;
3. backend verifica permiso y organización;
4. valida archivo;
5. `EvidenceProvider` almacena documento;
6. se crea metadata `evidence_items`;
7. auditoría registra la carga;
8. UI refresca listado.

Descarga:

1. validar sesión;
2. validar membership y permiso;
3. validar que evidencia pertenece a organización;
4. obtener acceso temporal/proxy seguro desde proveedor;
5. registrar evento si la política requiere auditar descargas.

El frontend nunca construye una ruta arbitraria de otra organización para obtener archivos.

## 9. Comentarios y revisiones

Comentarios son colaboración. Revisiones son actos formales distintos.

No mezclar ambos objetos si negocio necesita demostrar quién validó un control y cuándo.

## 10. Reportes

Los reportes consultan un snapshot coherente.

Tipos iniciales posibles:

- resumen ejecutivo;
- matriz;
- acciones;
- assessment;
- evidencias/index;
- historial.

Exportar datos requiere permiso específico y auditoría cuando el alcance sea sensible.

## 11. Consola TIBOX

La consola global muestra primero información resumida:

- cliente;
- status;
- avance;
- acciones vencidas;
- riesgos;
- última actividad;
- integración.

Abrir el detalle del cliente requiere permiso de plataforma y aplica la política de soporte/consultoría aprobada.

## 12. Soporte

Flujo recomendado:

1. seleccionar cliente;
2. solicitar acceso de soporte;
3. indicar motivo/ticket;
4. crear sesión/contexto de soporte;
5. banner visible;
6. auditar operaciones;
7. terminar acceso.

## 13. Integración SharePoint

Si está activa:

1. organización conecta Microsoft 365;
2. se autoriza tenant/sitio/biblioteca;
3. `SharePointProvider` usa Graph en servidor;
4. metadata común queda en Supabase;
5. binario permanece en SharePoint;
6. revocación desconecta sin borrar automáticamente documentos del tenant.

Borrado en SharePoint debe obedecer política explícita, no inferirse al desconectar.

## 14. Baja de usuario

- revocar membership;
- conservar actor histórico en auditoría;
- reasignar tareas si corresponde;
- invalidar permisos inmediatamente;
- no eliminar auditoría asociada.

## 15. Baja de cliente

Seguir `OPERACION.md` y la política contractual de exportación/retención.

## 16. Errores

El usuario recibe un mensaje útil sin stack traces ni secretos.

Internamente registrar:

- código de error;
- request id;
- ruta;
- contexto técnico mínimo;
- organización solo si es necesario y no expone información indebidamente.

## 17. Principio de consistencia

Cada flujo que cambie información debe pasar por la misma secuencia conceptual:

```text
AUTH → TENANT → PERMISSION → VALIDATION → MUTATION → AUDIT → SIDE EFFECTS
```

No ejecutar email, sync o notificación antes de que la transacción principal esté validada.