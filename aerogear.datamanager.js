/*! AeroGear JavaScript Library - v1.5.2 - 2014-10-03
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
(function( window, undefined ) {

/**
    The AeroGear namespace provides a way to encapsulate the library's properties and methods away from the global namespace
    @namespace
 */
this.AeroGear = {};

/**
    AeroGear.Core is a base for all of the library modules to extend. It is not to be instantiated and will throw an error when attempted
    @class
    @private
 */
AeroGear.Core = function() {
    // Prevent instantiation of this base class
    if ( this instanceof AeroGear.Core ) {
        throw "Invalid instantiation of base class AeroGear.Core";
    }

    /**
        This function is used by the different parts of AeroGear to add a new Object to its respective collection.
        @name AeroGear.add
        @method
        @param {String|Array|Object} config - This can be a variety of types specifying how to create the object. See the particular constructor for the object calling .add for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.add = function( config ) {
        var i,
            current,
            collection = this[ this.collectionName ] || {};
        this[ this.collectionName ] = collection;

        if ( !config ) {
            return this;
        } else if ( typeof config === "string" ) {
            // config is a string so use default adapter type
            collection[ config ] = AeroGear[ this.lib ].adapters[ this.type ]( config, this.config );
        } else if ( Array.isArray( config ) ) {
            // config is an array so loop through each item in the array
            for ( i = 0; i < config.length; i++ ) {
                current = config[ i ];

                if ( typeof current === "string" ) {
                    collection[ current ] = AeroGear[ this.lib ].adapters[ this.type ]( current, this.config );
                } else {
                    if( current.name ) {

                        // Merge the Module( pipeline, datamanger, ... )config with the adapters settings
                        current.settings = AeroGear.extend( current.settings || {}, this.config );

                        collection[ current.name ] = AeroGear[ this.lib ].adapters[ current.type || this.type ]( current.name, current.settings );
                    }
                }
            }
        } else {
            if( !config.name ) {
                return this;
            }

            // Merge the Module( pipeline, datamanger, ... )config with the adapters settings
            // config is an object so use that signature
            config.settings = AeroGear.extend( config.settings || {}, this.config );

            collection[ config.name ] = AeroGear[ this.lib ].adapters[ config.type || this.type ]( config.name, config.settings );
        }

        // reset the collection instance
        this[ this.collectionName ] = collection;

        return this;
    };
    /**
        This function is used internally by pipeline, datamanager, etc. to remove an Object (pipe, store, etc.) from the respective collection.
        @name AeroGear.remove
        @method
        @param {String|String[]|Object[]|Object} config - This can be a variety of types specifying how to remove the object. See the particular constructor for the object calling .remove for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.remove = function( config ) {
        var i,
            current,
            collection = this[ this.collectionName ] || {};

        if ( typeof config === "string" ) {
            // config is a string so delete that item by name
            delete collection[ config ];
        } else if ( Array.isArray( config ) ) {
            // config is an array so loop through each item in the array
            for ( i = 0; i < config.length; i++ ) {
                current = config[ i ];

                if ( typeof current === "string" ) {
                    delete collection[ current ];
                } else {
                    delete collection[ current.name ];
                }
            }
        } else if ( config ) {
            // config is an object so use that signature
            delete collection[ config.name ];
        }

        // reset the collection instance
        this[ this.collectionName ] = collection;

        return this;
    };
};

/**
    Utility function to test if an object is an Array
    @private
    @method
    @deprecated
    @param {Object} obj - This can be any object to test
*/
AeroGear.isArray = function( obj ) {
    return Array.isArray( obj );
};

/**
    Utility function to merge many Objects in one target Object which is the first object in arguments list.
    @private
    @method
*/
AeroGear.extend = function() {
    var name, i, source,
        target = arguments[ 0 ];
    for( i=1; i<arguments.length; i++ ) {
        source = arguments[ i ];
        for( name in source ) {
            target[ name ] = source[ name ];
        }
    }
    return target;
};

/**
    This callback is executed when an HTTP request completes whether it was successful or not.
    @callback AeroGear~completeCallbackREST
    @param {Object} jqXHR - The jQuery specific XHR object
    @param {String} textStatus - The text status message returned from the server
 */
/**
    This callback is executed when an HTTP error is encountered during a request.
    @callback AeroGear~errorCallbackREST
    @param {Object} jqXHR - The jQuery specific XHR object
    @param {String} textStatus - The text status message returned from the server
    @param {Object} errorThrown - The HTTP error thrown which caused the is callback to be called
 */
/**
    This callback is executed when an HTTP success message is returned during a request.
    @callback AeroGear~successCallbackREST
    @param {Object} data - The data, if any, returned in the response
    @param {String} textStatus - The text status message returned from the server
    @param {Object} jqXHR - The jQuery specific XHR object
 */
 /**
    This callback is executed when an HTTP progress message is returned during a request.
    @callback AeroGear~progressCallbackREST
    @param {Object} XMLHttpRequestProgressEvent - The progress event
 */
/**
    This callback is executed when an error is encountered saving to local or session storage.
    @callback AeroGear~errorCallbackStorage
    @param {Object} errorThrown - The HTTP error thrown which caused the is callback to be called
    @param {Object|Array} data - An object or array of objects representing the data for the failed save attempt.
 */
/**
    This callback is executed when data is successfully saved to session or local storage.
    @callback AeroGear~successCallbackStorage
    @param {Object} data - The updated data object after the new saved data has been added
 */

/**
    A collection of data connections (stores) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.
    @status Stable
    @class
    @augments AeroGear.Core
    @param {String|Array|Object} [config] - A configuration for the store(s) being created along with the DataManager. If an object or array containing objects is used, the objects can have the following properties:
    @param {String} config.name - the name that the store will later be referenced by
    @param {String} [config.type="Memory"] - the type of store as determined by the adapter used
    @param {String} [config.recordId="id"] - @deprecated the identifier used to denote the unique id for each record in the data associated with this store
    @param {Object} [config.settings={}] - the settings to be passed to the adapter. For specific settings, see the documentation for the adapter you are using.
    @param {Boolean} [config.settings.fallback=true] - falling back to a supported adapter is on by default, to opt-out, set this setting to false
    @param {Array} [config.settings.preferred] - a list of preferred adapters to try when falling back. Defaults to [ "IndexedDB", "WebSQL", "SessionLocal", "Memory" ]
    @returns {object} dataManager - The created DataManager containing any stores that may have been created
    @example
// Create an empty DataManager
var dm = AeroGear.DataManager();

// Create a single store using the default adapter
var dm2 = AeroGear.DataManager( "tasks" );

// Create multiple stores using the default adapter
var dm3 = AeroGear.DataManager( [ "tasks", "projects" ] );

// Create a custom store
var dm3 = AeroGear.DataManager({
    name: "mySessionStorage",
    type: "SessionLocal",
    id: "customID"
});

// Create multiple custom stores
var dm4 = AeroGear.DataManager([
    {
        name: "mySessionStorage",
        type: "SessionLocal",
        id: "customID"
    },
    {
        name: "mySessionStorage2",
        type: "SessionLocal",
        id: "otherId",
        settings: { ... }
    }
]);
 */
AeroGear.DataManager = function( config ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager ) ) {
        return new AeroGear.DataManager( config );
    }

    /**
        This function is used by the AeroGear.DataManager to add a new Object to its respective collection.
        @name AeroGear.add
        @method
        @param {String|Array|Object} config - This can be a variety of types specifying how to create the object. See the particular constructor for the object calling .add for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.add = function( config ){
        config = config || {};

        var i, type, fallback, preferred, settings;

        config = Array.isArray( config ) ? config : [ config ];

        config = config.map( function( value, index, array ) {
            settings = value.settings || {};
            fallback = settings.fallback === false ? false : true;
            if( fallback ) {
                preferred = settings.preferred ? settings.preferred : AeroGear.DataManager.preferred;
                if ( typeof value !== "string" ) {
                    type = value.type || "Memory";
                    if( !( type in AeroGear.DataManager.validAdapters ) ) {
                        for( i = 0; i < preferred.length; i++ ) {
                            if( preferred[ i ] in AeroGear.DataManager.validAdapters ) {
                                // For Deprecation purposes in 1.3.0  will be removed in 1.4.0
                                if( type === "IndexedDB" || type === "WebSQL" ) {
                                    value.settings = AeroGear.extend( value.settings || {}, { async: true } );
                                }
                                value.type = preferred[ i ];
                                return value;
                            }
                        }
                    }
                }
            }
            return value;
        }, this );

        AeroGear.Core.call( this );
        this.add( config );

        // Put back DataManager.add
        this.add = this._add;
    };

    // Save a reference to DataManager.add to put back later
    this._add = this.add;

    /**
        This function is used internally by datamanager to remove an Object from the respective collection.
        @name AeroGear.remove
        @method
        @param {String|String[]|Object[]|Object} config - This can be a variety of types specifying how to remove the object.
        @returns {Object} The object containing the collection that was updated
     */
    this.remove = function( config ){
        AeroGear.Core.call( this );
        this.remove( config );

        // Put back DataManager.remove
        this.remove = this._remove;
    };

    // Save a reference to DataManager.remove to put back later
    this._remove = this.remove;

    this.lib = "DataManager";

    this.type = config ? config.type || "Memory" : "Memory";

    /**
        The name used to reference the collection of data store instances created from the adapters
        @memberOf AeroGear.DataManager
        @type Object
        @default stores
     */
    this.collectionName = "stores";

    this.add( config );
};

AeroGear.DataManager.prototype = AeroGear.Core;
AeroGear.DataManager.constructor = AeroGear.DataManager;

/**
    Stores the valid adapters
*/
AeroGear.DataManager.validAdapters = {};

/**
    preferred adapters for the fallback strategy
*/
AeroGear.DataManager.preferred = [ "IndexedDB", "WebSQL", "SessionLocal", "Memory" ];

/**
    Method to determine and store what adapters are valid for this environment
*/
AeroGear.DataManager.validateAdapter = function( id, obj ) {
    if( obj.isValid() ) {
        AeroGear.DataManager.validAdapters[ id ] = obj;
    }
};

/**
    The adapters object is provided so that adapters can be added to the AeroGear.DataManager namespace dynamically and still be accessible to the add method
    @augments AeroGear.DataManager
 */
AeroGear.DataManager.adapters = {};

// Constants
AeroGear.DataManager.STATUS_NEW = 1;
AeroGear.DataManager.STATUS_MODIFIED = 2;
AeroGear.DataManager.STATUS_REMOVED = 0;

/**
    The Base adapter that all other adapters will extend from.
    Not to be Instantiated directly
 */
AeroGear.DataManager.adapters.base = function( storeName, settings ) {
    if ( this instanceof AeroGear.DataManager.adapters.base ) {
        throw "Invalid instantiation of base class AeroGear.DataManager.adapters.base";
    }

    settings = settings || {};

    // Private Instance vars
    var data = null,
        recordId = settings.recordId ? settings.recordId : "id",
        crypto = settings.crypto || {},
        cryptoOptions = crypto.options || {};

    // Privileged Methods
    /**
        Returns the value of the private data var
        @private
        @augments base
        @returns {Array}
     */
    this.getData = function() {
        return data || [];
    };

    /**
        Sets the value of the private data var
        @private
        @augments base
     */
    this.setData = function( newData ) {
        data = newData;
    };
    /**
        Returns the value of the private recordId var
        @private
        @augments base
        @returns {String}
     */
    this.getRecordId = function() {
        return recordId;
    };

    /**
        A Function for a jQuery.Deferred to always call
        @private
        @augments base
     */
    this.always = function( value, status, callback ) {
        if( callback ) {
            callback.call( this, value, status );
        }
    };

    /**
        Encrypt data being saved or updated if applicable
        @private
        @augments base
     */
    this.encrypt = function( data ) {
        var content;

        if( crypto.agcrypto ) {
            cryptoOptions.data = sjcl.codec.utf8String.toBits( JSON.stringify( data ) );
            content = {
                id: data[ recordId ],
                data: crypto.agcrypto.encrypt( cryptoOptions )
            };
            window.localStorage.setItem( "ag-" + storeName + "-IV", JSON.stringify( { id: crypto.agcrypto.getIV() } ) );
            return content;
        }

        return data;
    };

    /**
        Decrypt data being read if applicable
        @private
        @augments base
     */
    this.decrypt = function( data, isSessionLocal ) {
        var content, IV;

        if( crypto.agcrypto ) {
            IV = JSON.parse( window.localStorage.getItem( "ag-" + storeName + "-IV" ) ) || {};
            cryptoOptions.IV = IV.id;
            data = Array.isArray( data ) ? data : [ data ];
            content = data.map( function( value ) {
                cryptoOptions.data = value.data;
                return JSON.parse( sjcl.codec.utf8String.fromBits( crypto.agcrypto.decrypt( cryptoOptions ) ) );
            });

            return isSessionLocal ? content[ 0 ] : content;
        }

        return data;
    };
};

/**
    The Memory adapter is the default type used when creating a new store. Data is simply stored in a data var and is lost on unload (close window, leave page, etc.)
    This constructor is instantiated when the "DataManager.add()" method is called
    @status Stable
    @constructs AeroGear.DataManager.adapters.Memory
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @returns {Object} The created store
    @example
// Create an empty DataManager
var dm = AeroGear.DataManager();

// Add a custom memory store
dm.add({
    name: "newStore",
    settings: {
        recordId: "customID"
    }
});
 */
AeroGear.DataManager.adapters.Memory = function( storeName, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.Memory ) ) {
        return new AeroGear.DataManager.adapters.Memory( storeName, settings );
    }

    AeroGear.DataManager.adapters.base.apply( this, arguments );
    /**
        Empties the value of the private data var
        @private
        @augments Memory
     */
    this.emptyData = function() {
        this.setData( null );
    };

    /**
        Adds a record to the store's data set
        @private
        @augments Memory
     */
    this.addDataRecord = function( record ) {
        this.getData().push( record );
    };

    /**
        Adds a record to the store's data set
        @private
        @augments Memory
     */
    this.updateDataRecord = function( index, record ) {
        this.getData()[ index ] = record;
    };

    /**
        Removes a single record from the store's data set
        @private
        @augments Memory
     */
    this.removeDataRecord = function( index ) {
        this.getData().splice( index, 1 );
    };

    /**
        Returns a synchronous jQuery.Deferred for api symmetry
        @private
        @augments base
     */
    this.open = function( options ) {
        return jQuery.Deferred().resolve( undefined, "success", options && options.success );
    };

    /**
        Returns a synchronous jQuery.Deferred for api symmetry
        @private
        @augments base
    */
    this.close = function() {
        // purposefully left empty
    };

    /**
        Little utility used to compare nested object values in the filter method
        @private
        @augments Memory
        @param {String} nestedKey - Filter key to test
        @param {Object} nestedFilter - Filter object to test
        @param {Object} nestedValue - Value object to test
        @returns {Boolean}
     */
    this.traverseObjects = function( nestedKey, nestedFilter, nestedValue ) {
        while ( typeof nestedFilter === "object" ) {
            if ( nestedValue ) {
                // Value contains this key so continue checking down the object tree
                nestedKey = Object.keys( nestedFilter )[ 0 ];
                nestedFilter = nestedFilter[ nestedKey ];
                nestedValue = nestedValue[ nestedKey ];
            } else {
                break;
            }
        }
        if ( nestedFilter === nestedValue ) {
            return true;
        } else {
            return false;
        }
    };
};

// Public Methods
/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.Memory.isValid = function() {
    return true;
};

/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackMEMORY} [options.success] - a callback to be called after successfully reading a Memory Store -  this read is synchronous but the callback is provided for API symmetry.
    @returns {Object} A jQuery.Deferred promise
    @example
var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

// Get an array of all data in the store
dm.read()
    .then( function( data ) {
        console.log( data );
    });

// Read a specific piece of data based on an id
dm.read( 12345 )
    .then( function( data ) {
        console.log( data );
    });
 */
AeroGear.DataManager.adapters.Memory.prototype.read = function( id, options ) {
    var filter = {},
        data,
        deferred = jQuery.Deferred();

    filter[ this.getRecordId() ] = id;
    if( id ) {
        this.filter( filter ).then( function( filtered ) { data = filtered; } );
    } else {
        data = this.getData();
    }

    deferred.always( this.always );
    return deferred.resolve( data, "success", options ? options.success : undefined );
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @param {AeroGear~successCallbackMEMORY} [options.success] - a callback to be called after successfully saving data from a Memory Store -  this save is synchronous but the callback is provided for API symmetry.
    @returns {Object} A jQuery.Deferred promise
    @example
var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

// Store a new task
dm.save({
    title: "Created Task",
    date: "2012-07-13",
    ...
});

// Store an array of new Tasks
dm.save([
    {
        title: "Task2",
        date: "2012-07-13"
    },
    {
        title: "Task3",
        date: "2012-07-13"
        ...
    }
]);

// Update an existing piece of data
var toUpdate = dm.read()[ 0 ];
toUpdate.data.title = "Updated Task";
dm.save( toUpdate );
 */
AeroGear.DataManager.adapters.Memory.prototype.save = function( data, options ) {
    var itemFound = false,
        deferred = jQuery.Deferred();

    data = Array.isArray( data ) ? data : [ data ];

    if ( options && options.reset ) {
        this.setData( data );
    } else {
        if ( this.getData() && this.getData().length !== 0 ) {
            for ( var i = 0; i < data.length; i++ ) {
                for( var item in this.getData() ) {
                    if ( this.getData()[ item ][ this.getRecordId() ] === data[ i ][ this.getRecordId() ] ) {
                        this.updateDataRecord( item, data[ i ] );
                        itemFound = true;
                        break;
                    }
                }
                if ( !itemFound ) {
                    this.addDataRecord( data[ i ] );
                }

                itemFound = false;
            }
        } else {
            this.setData( data );
        }
    }
    deferred.always( this.always );
    return deferred.resolve( this.getData(), "success", options ? options.success : undefined );
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackMEMORY} [options.success] - a callback to be called after successfully removing data from a  Memory Store -  this remove is synchronous but the callback is provided for API symmetry.
    @returns {Object} A jQuery.Deferred promise
    @example
var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

// Store a new task
dm.save({
    title: "Created Task"
});

// Store another new task
dm.save({
    title: "Another Created Task"
});

// Store one more new task
dm.save({
    title: "And Another Created Task"
});

// Delete a record
dm.remove( 1, {
    success: function( data ) { ... },
    error: function( error ) { ... }
});

// Remove all data
dm.remove( undefined, {
    success: function( data ) { ... },
    error: function( error ) { ... }
});

// Delete all remaining data from the store
dm.remove();
 */
AeroGear.DataManager.adapters.Memory.prototype.remove = function( toRemove, options ) {
    var delId, data, item,
        deferred = jQuery.Deferred();

    deferred.always( this.always );

    if ( !toRemove ) {
        // empty data array and return
        this.emptyData();
        return deferred.resolve( this.getData(), "success", options ? options.success : undefined );
    } else {
        toRemove = Array.isArray( toRemove ) ? toRemove : [ toRemove ];
    }

    for ( var i = 0; i < toRemove.length; i++ ) {
        if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
            delId = toRemove[ i ];
        } else if ( toRemove ) {
            delId = toRemove[ i ][ this.getRecordId() ];
        } else {
            // Missing record id so just skip this item in the arrray
            continue;
        }

        data = this.getData( true );
        for( item in data ) {
            if ( data[ item ][ this.getRecordId() ] === delId ) {
                this.removeDataRecord( item );
            }
        }
    }

    return deferred.resolve( this.getData(), "success", options ? options.success : undefined );
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key/value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackMEMORY} [options.success] - a callback to be called after successfully filter data from a Memory Store -  this filter is synchronous but the callback is provided for API symmetry.
    @return {Object} A jQuery.Deferred promise
    @example
var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

// An object can be passed to filter the data
// This would return all records with a user named 'admin' **AND** a date of '2012-08-01'
dm.stores.tasks.filter({
        date: "2012-08-01",
        user: "admin"
    },
    {
        success: function( data ) { ... },
        error: function( error ) { ... }
    }
);

// The matchAny parameter changes the search to an OR operation
// This would return all records with a user named 'admin' **OR** a date of '2012-08-01'
dm.stores.tasks.filter({
        date: "2012-08-01",
        user: "admin"
    },
    true,
    {
        success: function( data ) { ... },
        error: function( error ) { ... }
    }
);
 */
AeroGear.DataManager.adapters.Memory.prototype.filter = function( filterParameters, matchAny, options ) {
    var filtered, key, j, k, l, nestedKey, nestedFilter, nestedValue,
        that = this,
        deferred = jQuery.Deferred();

    deferred.always( this.always );

    if ( !filterParameters ) {
        filtered = this.getData() || [];
        return deferred.resolve( filtered, "success", options ? options.success : undefined );
    }

    filtered = this.getData().filter( function( value, index, array) {
        var match = matchAny ? false : true,
            keys = Object.keys( filterParameters ),
            filterObj, paramMatch, paramResult;

        for ( key = 0; key < keys.length; key++ ) {
            if ( filterParameters[ keys[ key ] ].data ) {
                // Parameter value is an object
                filterObj = filterParameters[ keys[ key ] ];
                paramResult = filterObj.matchAny ? false : true;

                for ( j = 0; j < filterObj.data.length; j++ ) {
                    if( Array.isArray( value[ keys[ key ] ] ) ) {
                        if( value[ keys [ key ] ].length ) {
                            if( jQuery( value[ keys ] ).not( filterObj.data ).length === 0 && jQuery( filterObj.data ).not( value[ keys ] ).length === 0 ) {
                                paramResult = true;
                                break;
                            } else {
                                for( k = 0; k < value[ keys[ key ] ].length; k++ ) {
                                    if ( filterObj.matchAny && filterObj.data[ j ] === value[ keys[ key ] ][ k ] ) {
                                        // At least one value must match and this one does so return true
                                        paramResult = true;
                                        if( matchAny ) {
                                            break;
                                        } else {
                                            for( l = 0; l < value[ keys[ key ] ].length; l++ ) {
                                                if( !matchAny && filterObj.data[ j ] !== value[ keys[ key ] ][ l ] ) {
                                                    // All must match but this one doesn't so return false
                                                    paramResult = false;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    if ( !filterObj.matchAny && filterObj.data[ j ] !== value[ keys[ key ] ][ k ] ) {
                                        // All must match but this one doesn't so return false
                                        paramResult = false;
                                        break;
                                    }
                                }
                            }
                        } else {
                            paramResult = false;
                        }
                    } else {
                        if ( typeof filterObj.data[ j ] === "object" ) {
                            if ( filterObj.matchAny && that.traverseObjects( keys[ key ], filterObj.data[ j ], value[ keys[ key ] ] ) ) {
                                // At least one value must match and this one does so return true
                                paramResult = true;
                                break;
                            }
                            if ( !filterObj.matchAny && !that.traverseObjects( keys[ key ], filterObj.data[ j ], value[ keys[ key ] ] ) ) {
                                // All must match but this one doesn't so return false
                                paramResult = false;
                                break;
                            }
                        } else {
                            if ( filterObj.matchAny && filterObj.data[ j ] === value[ keys[ key ] ] ) {
                                // At least one value must match and this one does so return true
                                paramResult = true;
                                break;
                            }
                            if ( !filterObj.matchAny && filterObj.data[ j ] !== value[ keys[ key ] ] ) {
                                // All must match but this one doesn't so return false
                                paramResult = false;
                                break;
                            }
                        }
                    }
                }
            } else {
                // Filter on parameter value
                if( Array.isArray( value[ keys[ key ] ] ) ) {
                    paramResult = matchAny ? false: true;

                    if( value[ keys[ key ] ].length ) {
                        for(j = 0; j < value[ keys[ key ] ].length; j++ ) {
                            if( matchAny && filterParameters[ keys[ key ] ] === value[ keys[ key ] ][ j ]  ) {
                                // at least one must match and this one does so return true
                                paramResult = true;
                                break;
                            }
                            if( !matchAny && filterParameters[ keys[ key ] ] !== value[ keys[ key ] ][ j ] ) {
                                // All must match but this one doesn't so return false
                                paramResult = false;
                                break;
                            }
                        }
                    } else {
                        paramResult = false;
                    }
                } else {
                    if ( typeof filterParameters[ keys[ key ] ] === "object" ) {
                        paramResult = that.traverseObjects( keys[ key ], filterParameters[ keys[ key ] ], value[ keys[ key ] ] );
                    } else {
                        paramResult = filterParameters[ keys[ key ] ] === value[ keys[ key ] ] ? true : false;
                    }
                }
            }

            if ( matchAny && paramResult ) {
                // At least one item must match and this one does so return true
                match = true;
                break;
            }
            if ( !matchAny && !paramResult ) {
                // All must match but this one doesn't so return false
                match = false;
                break;
            }
        }

        return match;
    });
    return deferred.resolve( filtered, "success", options ? options.success : undefined );
};

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "Memory", AeroGear.DataManager.adapters.Memory );

/**
    The SessionLocal adapter extends the Memory adapter to store data in either session or local storage which makes it a little more persistent than memory
    This constructor is instantiated when the "DataManager.add()" method is called
    @status Stable
    @constructs AeroGear.DataManager.adapters.SessionLocal
    @mixes AeroGear.DataManager.adapters.Memory
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {String} [settings.storageType="sessionStorage"] - the type of store can either be sessionStorage or localStorage
    @param {Object} [settings.crypto] - the crypto settings to be passed to the adapter
    @param {Object} [settings.crypto.agcrypto] - the AeroGear.Crypto object to be used
    @param {Object} [settings.crypto.options] - the specific options for the AeroGear.Crypto encrypt/decrypt methods
    @returns {Object} The created store
    @example
// Create an empty DataManager
var dm = AeroGear.DataManager();

// Add a custom SessionLocal store using local storage as its storage type
dm.add({
    name: "newStore",
    type: "SessionLocal"
    settings: {
        recordId: "customID",
        storageType: "localStorage"
    }
});
 */
AeroGear.DataManager.adapters.SessionLocal = function( storeName, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.SessionLocal ) ) {
        return new AeroGear.DataManager.adapters.SessionLocal( storeName, settings );
    }

    AeroGear.DataManager.adapters.Memory.apply( this, arguments );

    // Private Instance vars
    var storeType = settings.storageType || "sessionStorage",
        name = storeName,
        appContext = document.location.pathname.replace(/[\/\.]/g,"-"),
        storeKey = name + appContext,
        content = window[ storeType ].getItem( storeKey ),
        currentData = content ? this.decrypt( JSON.parse( content ), true ) : null ;

    // Initialize data from the persistent store if it exists
    if ( currentData ) {
        AeroGear.DataManager.adapters.Memory.prototype.save.call( this, currentData, true );
    }

    // Privileged Methods
    /**
        Returns the value of the private storeType var
        @private
        @augments SessionLocal
        @returns {String}
     */
    this.getStoreType = function() {
        return storeType;
    };

    /**
        Returns the value of the private storeKey var
        @private
        @augments SessionLocal
        @returns {String}
     */
    this.getStoreKey = function() {
        return storeKey;
    };
};

/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.SessionLocal.isValid = function() {
    try {
        return !!(window.localStorage && window.sessionStorage);
    } catch( error ){
        return false;
    }
};

// Inherit from the Memory adapter
AeroGear.DataManager.adapters.SessionLocal.prototype = Object.create( new AeroGear.DataManager.adapters.Memory(), {
    // Public Methods
    /**
        Saves data to the store, optionally clearing and resetting the data
        @method
        @memberof AeroGear.DataManager.adapters.SessionLocal
        @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
        @param {Object} [options] - The options to be passed to the save method
        @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
        @param {AeroGear~errorCallbackStorage} [options.error] - A callback to be executed when an error is thrown trying to save data to the store. The most likely error is when the localStorage is full. The callback is passed the error object and the data that was attempted to be saved as arguments.
        @param {AeroGear~success} [options.success] - A callback to be called if the save was successful. This probably isn't necessary since the save is synchronous but is provided for API symmetry.
        @returns {Object} A jQuery.Deferred promise
        @example
var dm = AeroGear.DataManager([{ name: "tasks", type: "SessionLocal" }]).stores[ 0 ];

// Store a new task
dm.save({
    title: "Created Task",
    date: "2012-07-13",
    ...
});

// Store an array of new Tasks
dm.save([
    {
        title: "Task2",
        date: "2012-07-13"
    },
    {
        title: "Task3",
        date: "2012-07-13"
        ...
    }
]);

// Update an existing piece of data
var toUpdate = dm.read()[ 0 ];
toUpdate.data.title = "Updated Task";
dm.save( toUpdate );
     */
    save: {
        value: function( data, options ) {
            // Call the super method
            var newData,
                deferred = jQuery.Deferred(),
                reset = options && options.reset ? options.reset : false,
                oldData = window[ this.getStoreType() ].getItem( this.getStoreKey() );

            AeroGear.DataManager.adapters.Memory.prototype.save.apply( this, [ arguments[ 0 ], { reset: reset } ] ).then( function( data ) {
                newData = data;
            });

            deferred.always( this.always );

            // Sync changes to persistent store
            try {
                window[ this.getStoreType() ].setItem( this.getStoreKey(), JSON.stringify( this.encrypt( newData ) ) );
                if ( options && options.success ) {
                    options.storageSuccess( newData );
                }
            } catch( error ) {
                oldData = oldData ? JSON.parse( oldData ) : [];

                AeroGear.DataManager.adapters.Memory.prototype.save.apply( this, [ oldData, { reset: reset } ] ).then( function( data ) {
                    newData = data;
                });

                if ( options && options.error ) {
                    return deferred.reject( data, "error", options ? options.error : undefined );
                } else {
                    deferred.reject();
                    throw error;
                }
            }

            return deferred.resolve( newData, "success", options ? options.success : undefined );
        }, enumerable: true, configurable: true, writable: true
    },
    /**
        Removes data from the store
        @method
        @memberof AeroGear.DataManager.adapters.SessionLocal
        @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
        @param {Object} [options] - The options to be passed to the save method
        @param {AeroGear~successrCallbackStorage} [options.success] - A callback to be called if the remove was successful. This probably isn't necessary since the remove is synchronous but is provided for API symmetry.
        @returns {Object} A jQuery.Deferred promise
        @example
var dm = AeroGear.DataManager([{ name: "tasks", type: "SessionLocal" }]).stores[ 0 ];

// Store a new task
dm.save({
    title: "Created Task"
});

// Store another new task
dm.save({
    title: "Another Created Task"
});

// Store one more new task
dm.save({
    title: "And Another Created Task"
});

// Delete a record
dm.remove( 1, {
    success: function( data ) { ... },
    error: function( error ) { ... }
});

// Remove all data
dm.remove( undefined, {
    success: function( data ) { ... },
    error: function( error ) { ... }
});

// Delete all remaining data from the store
dm.remove();
     */
    remove: {
        value: function( toRemove, options ) {
            // Call the super method
            var newData,
                deferred = jQuery.Deferred();

            AeroGear.DataManager.adapters.Memory.prototype.remove.apply( this, arguments ).then( function( data ) {
                newData = data;
            });

            // Sync changes to persistent store
            window[ this.getStoreType() ].setItem( this.getStoreKey(), JSON.stringify( this.encrypt( newData ) ) );

            deferred.always( this.always );
            return deferred.resolve( newData, status, options ? options.success : undefined );
        }, enumerable: true, configurable: true, writable: true
    }
});

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "SessionLocal", AeroGear.DataManager.adapters.SessionLocal );

/**
    The IndexedDB adapter stores data in an IndexedDB database for more persistent client side storage
    This constructor is instantiated when the "DataManager.add()" method is called
    @constructs AeroGear.DataManager.adapters.IndexedDB
    @status Experimental
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {Boolean} [settings.auto=false] - set to 'true' to enable 'auto-connect' for read/remove/save/filter
    @param {Object} [settings.crypto] - the crypto settings to be passed to the adapter
    @param {Object} [settings.crypto.agcrypto] - the AeroGear.Crypto object to be used
    @param {Object} [settings.crypto.options] - the specific options for the AeroGear.Crypto encrypt/decrypt methods
    @returns {Object} The created store
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

 */
AeroGear.DataManager.adapters.IndexedDB = function( storeName, settings ) {

    if ( !window.indexedDB ) {
        throw "Your browser doesn't support IndexedDB";
    }

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.IndexedDB ) ) {
        return new AeroGear.DataManager.adapters.IndexedDB( storeName, settings );
    }

    AeroGear.DataManager.adapters.base.apply( this, arguments );

    settings = settings || {};

    // Private Instance vars
    var request, database,
        auto = settings.auto;

    // Privileged Methods
    /**
        Returns the value of the private database var
        @private
        @augments IndexedDB
        @returns {Object}
     */
    this.getDatabase = function() {
        return database;
    };

    /**
        Sets the value of the private database var
        @private
        @augments IndexedDB
     */
    this.setDatabase = function( db ) {
        database = db;
    };

    /**
        Returns the value of the private storeName var
        @private
        @augments IndexedDB
        @returns {String}
     */
    this.getStoreName = function() {
        return storeName;
    };

    /**
        @private
        @augments IndexedDB
        Compatibility fix
        Added in 1.3 to remove in 1.4
    */
    this.getAsync = function() {
        return true;
    };

    /**
        This function will check if the database is open.
        If 'auto' is not true, an error is thrown.
        If 'auto' is true, attempt to open the database then
        run the function passed in
        @private
        @augments IndexedDB
     */
    this.run = function( fn ) {
        var that = this;

        if( !database ) {
            if( !auto ) {
                // hasn't been opened yet
                throw "Database not opened";
            } else {
                this.open().always( function( value, status ) {
                    if( status === "error" ) {
                        throw "Database not opened";
                    } else {
                        fn.call( that, database );
                    }
                });
            }
        } else {
            fn.call( this, database );
        }
    };
};

// Public Methods
/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.IndexedDB.isValid = function() {
    return !!window.indexedDB;
};

/**
    Open the Database
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackINDEXEDDB} [settings.success] - a callback to be called after successfully opening an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [settings.error] - a callback to be called when there is an error with the opening of an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });
*/
AeroGear.DataManager.adapters.IndexedDB.prototype.open = function( options ) {
    options = options || {};

    var request, database,
        that = this,
        storeName = this.getStoreName(),
        recordId = this.getRecordId(),
        deferred = jQuery.Deferred();

    // Attempt to open the indexedDB database
    request = window.indexedDB.open( storeName );

    request.onsuccess = function( event ) {
        database = event.target.result;
        that.setDatabase( database );
        deferred.resolve( database, "success", options.success );
    };

    request.onerror = function( event ) {
        deferred.reject( event, "error", options.error );
    };

    // Only called when the database doesn't exist and needs to be created
    request.onupgradeneeded = function( event ) {
        database = event.target.result;
        database.createObjectStore( storeName, { keyPath: recordId } );
    };

    deferred.always( this.always );
    return deferred.promise();
};


/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @param {Object} [options={}] - additional options
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called after the successful reading of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called when there is an error reading an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    dm.stores.test1.read( undefined, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

    // read a record with a particular id
    dm.stores.test1.read( 5, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.read = function( id, options ) {
    options = options || {};

    var transaction, objectStore, cursor, request, _read,
        that = this,
        data = [],
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred();

    _read = function( database ) {

        if( !database.objectStoreNames.contains( storeName ) ) {
            deferred.resolve( [], "success", options.success );
        }

        transaction = database.transaction( storeName );
        objectStore = transaction.objectStore( storeName );

        if( id ) {
            request = objectStore.get( id );

            request.onsuccess = function( event ) {
                data.push( request.result );
            };

        } else {
            cursor = objectStore.openCursor();
            cursor.onsuccess = function( event ) {
                var result = event.target.result;
                if( result ) {
                    data.push( result.value );
                    result.continue();
                }
            };
        }

        transaction.oncomplete = function( event ) {
            deferred.resolve( that.decrypt( data ), "success", options.success );
        };

        transaction.onerror = function( event ) {
            deferred.reject( event, "error", options.error );
        };
    };

    this.run.call( this, _read );

    deferred.always( this.always );

    return deferred.promise();
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - additional options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called after the successful saving of a record into an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called when there is an error with the saving of a record into an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    dm.stores.newStore.save( { "id": 3, "name": "Grace", "type": "Little Person" }, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

    // Save multiple Records
    dm.stores.newStore.save(
        [
            { "id": 3, "name": "Grace", "type": "Little Person" },
            { "id": 4, "name": "Graeham", "type": "Really Little Person" }
        ],
        {
            success: function( data ) { ... },
            error: function( error ) { ... }
        }
    );
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.save = function( data, options ) {
    options = options || {};

    var transaction, objectStore, _save,
        that = this,
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred(),
        i = 0;

    _save = function( database ) {
        transaction = database.transaction( storeName, "readwrite" );
        objectStore = transaction.objectStore( storeName );

        if( options.reset ) {
            objectStore.clear();
        }

        if( Array.isArray( data ) ) {
            for( i; i < data.length; i++ ) {
                objectStore.put( this.encrypt( data[ i ] ) );
            }
        } else {
            objectStore.put( this.encrypt( data ) );
        }

        transaction.oncomplete = function( event ) {
            that.read().done( function( data, status ) {
                if( status === "success" ) {
                    deferred.resolve( data, status, options.success );
                } else {
                    deferred.reject( data, status, options.error );
                }
            });
        };

        transaction.onerror = function( event ) {
            deferred.reject( event, "error", options.error );
        };
    };

    this.run.call( this, _save );

    deferred.always( this.always );

    return deferred.promise();
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called after successfully removing a record out of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called when there is an error removing a record out of an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    // Delete a record
    dm.stores.newStore.remove( 1, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

    // Remove all data
    dm.stores.newStore.remove( undefined, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.remove = function( toRemove, options ) {
    options = options || {};

    var objectStore, transaction, _remove,
        that = this,
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred(),
        i = 0;

    _remove = function() {
        transaction = database.transaction( storeName, "readwrite" );
        objectStore = transaction.objectStore( storeName );

        if( !toRemove ) {
            objectStore.clear();
        } else  {
            toRemove = Array.isArray( toRemove ) ? toRemove: [ toRemove ];

            for( i; i < toRemove.length; i++ ) {
                if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
                    objectStore.delete( toRemove[ i ] );
                } else if ( toRemove ) {
                    objectStore.delete( toRemove[ i ][ this.getRecordId() ] );
                } else {
                    continue;
                }
            }
        }

        transaction.oncomplete = function( event ) {
            that.read().done( function( data, status ) {
                if( status === "success" ) {
                    deferred.resolve( data, status, options.success );
                } else {
                    deferred.reject( data, status, options.error );
                }
            });
        };

        transaction.onerror = function( event ) {
            deferred.reject( event, "error", options.error );
        };
    };

    this.run.call( this, _remove );

    deferred.always( this.always );

    return deferred.promise();
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key/value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called after successful filtering of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called after an error filtering of an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    dm.stores.test1.filter( { "name": "Lucas" }, true, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.filter = function( filterParameters, matchAny, options ) {
    options = options || {};

    var _filter,
        that = this,
        deferred = jQuery.Deferred(),
        database = this.getDatabase();

    _filter = function() {
        this.read().then( function( data, status ) {
            if( status !== "success" ) {
                deferred.reject( data, status, options.error );
                return;
            }

            AeroGear.DataManager.adapters.Memory.prototype.save.call( that, data, true );
            AeroGear.DataManager.adapters.Memory.prototype.filter.call( that, filterParameters, matchAny ).then( function( data ) {
                deferred.resolve( data, "success", options.success );
            });
        });
    };

    this.run.call( this, _filter );

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Close the current store
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store and then delete a record
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.close();
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.close = function() {
    var database = this.getDatabase();
    if( database ) {
        database.close();
    }
};

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "IndexedDB", AeroGear.DataManager.adapters.IndexedDB );

/**
    The WebSQL adapter stores data in a WebSQL database for more persistent client side storage
    This constructor is instantiated when the "DataManager.add()" method is called
    @constructs AeroGear.DataManager.adapters.WebSQL
    @status Experimental
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {Boolean} [settings.auto=false] - set to 'true' to enable 'auto-connect' for read/remove/save/filter
    @param {Object} [settings.crypto] - the crypto settings to be passed to the adapter
    @param {Object} [settings.crypto.agcrypto] - the AeroGear.Crypto object to be used
    @param {Object} [settings.crypto.options] - the specific options for the AeroGear.Crypto encrypt/decrypt methods
    @returns {Object} The created store
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

 */
AeroGear.DataManager.adapters.WebSQL = function( storeName, settings ) {

    if ( !window.openDatabase ) {
        throw "Your browser doesn't support WebSQL";
    }

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.WebSQL ) ) {
        return new AeroGear.DataManager.adapters.WebSQL( storeName, settings );
    }

    AeroGear.DataManager.adapters.base.apply( this, arguments );

    settings = settings || {};

    // Private Instance vars
    var database,
        auto = settings.auto;

    // Privileged Methods
    /**
        Returns the value of the private database var
        @private
        @augments WebSQL
        @returns {Object}
     */
    this.getDatabase = function() {
        return database;
    };

    /**
        Sets the value of the private database var
        @private
        @augments WebSQL
     */
    this.setDatabase = function( db ) {
        database = db;
    };

    /**
        Returns the value of the private storeName var
        @private
        @augments WebSQL
        @returns {String}
     */
    this.getStoreName = function() {
        return storeName;
    };

    /**
        @private
        @augments WebSQL
        Compatibility fix
        Added in 1.3 to remove in 1.4
    */
    this.getAsync = function() {
        return true;
    };

    /**
        This function will check if the database is open.
        If 'auto' is not true, an error is thrown.
        If 'auto' is true, attempt to open the databse then
        run the function passed in
        @private
        @augments WebSQL
     */
    this.run = function( callback ) {
        var that = this;

        if( !database ) {
            if( !auto ) {
                // hasn't been opened yet
                throw "Database not opened";
            } else {
                this.open().always( function( value, status ) {
                    if( status === "error" ) {
                        throw "Database not opened";
                    } else {
                        callback.call( that, database );
                    }
                });
            }
        } else {
            callback.call( this, database );
        }
    };
};

// Public Methods
/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.WebSQL.isValid = function() {
    return !!window.openDatabase;
};

/**
    Open the Database
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackWEBSQL} [settings.success] - a callback to be called when after successful opening of a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [settings.error] - a callback to be called when there is an error opening a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });
*/
AeroGear.DataManager.adapters.WebSQL.prototype.open = function( options ) {
    options = options || {};

    var success, error, database,
        that = this,
        version = "1",
        databaseSize = 2 * 1024 * 1024,
        recordId = this.getRecordId(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred();

    // Do some creation and such
    database = window.openDatabase( storeName, version, "AeroGear WebSQL Store", databaseSize );

    error = function( transaction, error ) {
        deferred.reject( error, "error", options.error );
    };

    success = function( transaction, result ) {
        that.setDatabase( database );
        deferred.resolve( database, "success", options.success );
    };

    database.transaction( function( transaction ) {
        transaction.executeSql( "CREATE TABLE IF NOT EXISTS '" + storeName + "' ( " + recordId + " REAL UNIQUE, json)", [], success, error );
    });

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @param {Object} [options={}] - additional options
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after successfully reading a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when there is an error reading a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    dm.stores.test1.read( undefined, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

    // read a record with a particular id
    dm.stores.test1.read( 5, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

 */
AeroGear.DataManager.adapters.WebSQL.prototype.read = function( id, options ) {
    options = options || {};

    var success, error, sql, _read,
        that = this,
        data = [],
        params = [],
        storeName = this.getStoreName(),
        database = this.getDatabase(),
        deferred = jQuery.Deferred(),
        i = 0;

    _read = function( database ) {
        error = function( transaction, error ) {
            deferred.reject( error, "error", options.error );
        };

        success = function( transaction, result ) {
            var rowLength = result.rows.length;
            for( i; i < rowLength; i++ ) {
                data.push( JSON.parse( result.rows.item( i ).json ) );
            }
            deferred.resolve( that.decrypt( data ), "success", options.success );
        };

        sql = "SELECT * FROM '" + storeName + "'";

        if( id ) {
            sql += " WHERE ID = ?";
            params = [ id ];
        }

        database.transaction( function( transaction ) {
            transaction.executeSql( sql, params, success, error );
        });
    };

    this.run.call( this, _read );

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - additional options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after successfully saving records to a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when there is an error saving records to a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    dm.stores.newStore.save( { "id": 3, "name": "Grace", "type": "Little Person" }, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

    // Save multiple Records
    dm.stores.newStore.save(
        [
            { "id": 3, "name": "Grace", "type": "Little Person" },
            { "id": 4, "name": "Graeham", "type": "Really Little Person" }
        ],
        {
            success: function( data ) { ... },
            error: function( error ) { ... }
        }
    );
 */
AeroGear.DataManager.adapters.WebSQL.prototype.save = function( data, options ) {
    options = options || {};

    var error, success, readSuccess, _save,
        that = this,
        recordId = this.getRecordId(),
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred(),
        i = 0;

    _save = function( database ) {
        error = function( transaction, error ) {
            deferred.reject( error, "error", options.error );
        };

        success = function( transaction, result ) {
            that.read().done( function( result, status ) {
                if( status === "success" ) {
                    deferred.resolve( result, status, options.success );
                } else {
                    deferred.reject( result, status, options.error );
                }
            });
        };

        data = Array.isArray( data ) ? data : [ data ];

        database.transaction( function( transaction ) {
            if( options.reset ) {
                transaction.executeSql( "DROP TABLE " + storeName );
                transaction.executeSql( "CREATE TABLE IF NOT EXISTS '" + storeName + "' ( " + recordId + " REAL UNIQUE, json)" );
            }
            data.forEach( function( value ) {
                value = that.encrypt( value );
                transaction.executeSql( "INSERT OR REPLACE INTO '" + storeName + "' ( id, json ) VALUES ( ?, ? ) ", [ value[ recordId ], JSON.stringify( value ) ] );
            });
        }, error, success );
    };

    this.run.call( this, _save );

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after successfully removing a record from a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when there is an error removing a record from a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    // Delete a record
    dm.stores.newStore.remove( 1, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

    // Remove all data
    dm.stores.newStore.remove( undefined, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

 */
AeroGear.DataManager.adapters.WebSQL.prototype.remove = function( toRemove, options ) {
    options = options || {};

    var sql, success, error, _remove,
        that = this,
        storeName = this.getStoreName(),
        database = this.getDatabase(),
        deferred = jQuery.Deferred(),
        i = 0;

    _remove = function( database ) {
        error = function( transaction, error ) {
            deferred.reject( error, "error", options.error );
        };

        success = function( transaction, result ) {
            that.read().done( function( result, status ) {
                if( status === "success" ) {
                    deferred.resolve( result, status, options.success );
                } else {
                    deferred.reject( result, status, options.error );
                }
            });
        };

        sql = "DELETE FROM '" + storeName + "'";

        if( !toRemove ) {
            // remove all
            database.transaction( function( transaction ) {
                transaction.executeSql( sql, [], success, error );
            });
        } else {
            toRemove = Array.isArray( toRemove ) ? toRemove: [ toRemove ];
            database.transaction( function( transaction ) {
                for( i; i < toRemove.length; i++ ) {
                    if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
                        transaction.executeSql( sql + " WHERE ID = ? ", [ toRemove[ i ] ] );
                    } else if ( toRemove ) {
                        transaction.executeSql( sql + " WHERE ID = ? ", [ toRemove[ i ][ this.getRecordId() ] ] );
                    } else {
                        continue;
                    }
                }
            }, error, success );
        }
    };

    this.run.call( this, _remove );

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key/value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after a successful filtering of a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be calledd after an error filtering a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    dm.stores.test1.filter( { "name": "Lucas" }, true, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });
 */
AeroGear.DataManager.adapters.WebSQL.prototype.filter = function( filterParameters, matchAny, options ) {
    options = options || {};

    var _filter,
        that = this,
        deferred = jQuery.Deferred(),
        db = this.getDatabase();

    _filter = function() {
        this.read().then( function( data, status ) {
        if( status !== "success" ) {
                deferred.reject( data, status, options.error );
                return;
            }

            AeroGear.DataManager.adapters.Memory.prototype.save.call( that, data, true );
            AeroGear.DataManager.adapters.Memory.prototype.filter.call( that, filterParameters, matchAny ).then( function( data ) {
                deferred.resolve( data, "success", options.success );
            });
        });
    };

    this.run.call( this, _filter );

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "WebSQL", AeroGear.DataManager.adapters.WebSQL );
})( this );
