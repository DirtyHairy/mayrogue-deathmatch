export default class DomainMap {

    constructor(width, height, accessibilityFn) {
        this._width = width;
        this._height = height;
        this._accessibilityFn = accessibilityFn;
        this._domains = [];
        this._domainMap = [];
        this._domainMappings = {};

        this._buildDomainMap();
    }

    getDomains() {
        return this._domains;
    }

    /*
     * Build the domain map.
     */
    _buildDomainMap() {
        let idx = 1;

        this._domainMappings[-1] = -1;

        for (let x = 0; x < this._width; x++) {
            this._domainMap[x] = [];
            for (let y = 0; y < this._height; y++) {
                let domain = -1;

                // Nothing to do if the field is not accessible
                if (this._accessibilityFn(x, y)) {
                    let otherDomain;

                    // Has the field left of us a domain assigned?
                    otherDomain = this.getDomain(x - 1, y);
                    if (x > 0 && otherDomain > 0) {
                        // -> Inherit the domain
                        domain = otherDomain;
                    }

                    // Has the field above us a domain assigned?
                    otherDomain = this.getDomain(x, y - 1);
                    if (y > 0 && otherDomain > 0) {
                        // We still have no domain -> inherit from above
                        if (domain < 0) {
                            domain = otherDomain;
                        // We have a domain -> conflict?
                    } else if (domain !== otherDomain) {
                            // Conflict! -> identify the two domains
                            this._identifyDomains(domain, otherDomain);
                        }
                    }
                    // Still no domain? Start a new one
                    if (domain < 0) {
                        domain = idx++;
                        this._addDomain(domain);
                    }
                }
                this._domainMap[x][y] = domain;
            }
        }
    }

    /**
     * Get the domain of a given position. Recursively resolves all mapping relations and stores the result
     * back in the map --- this improves lookup speed.
     */
    getDomain(x, y) {
        let domain = this._domainMap[x][y];

        while (this._domainMappings[domain] !== domain) {
            domain = this._domainMappings[domain];
        }
        this._domainMap[x][y] = domain;

        return domain;
    }

    /**
     * Add a new domain.
     */
    _addDomain(domain) {
        this._domains.push(domain);
        this._domainMappings[domain] = domain;
    }

    /**
     * Identify two domains by removing domain2 from the domain list and setting up a mapping between the two.
     */
    _identifyDomains(domain1, domain2) {
        this._domains = this._domains.filter(d => d !==domain2);
        this._domainMappings[domain2] = domain1;
    }

    /**
     * Find a field in a given domain.
     */
    findFieldInDomain(domain) {
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                if (this.getDomain(x, y) === domain) {
                    return {x: x, y: y};
                }
            }
        }

        return null;
    }

}
