package co.edu.eci.blueprints.filters;

import co.edu.eci.blueprints.model.Blueprint;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

/**
 * Filtro por defecto
 * Este filtro devuelve el blueprint sin cambios.
 */
@Component
@Profile("identity")
public class IdentityFilter implements BlueprintsFilter {
    @Override
    public Blueprint apply(Blueprint bp) { return bp; }
}
