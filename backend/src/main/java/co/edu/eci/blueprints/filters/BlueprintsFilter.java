package co.edu.eci.blueprints.filters;

import co.edu.eci.blueprints.model.Blueprint;

public interface BlueprintsFilter {
    Blueprint apply(Blueprint bp);
}
