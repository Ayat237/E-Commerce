export class ApiFeatureWithPlugin{
    constructor(model, query){
        // handle query request => req.query
        this.query = query;
        // handle model => productModel || categoryModel || ...
        this.model = model;

        // handle pagination and filter objects 
        this.paginationObject ={};
        this.filterObject = {};
    }

    // handel api methods 
    pagination(){
        const { page = 1, limit = 2 } = this.query;
        const skip = (page - 1) * limit;
        this.paginationObject = { 
            page : +page , 
            skip,
            limit: +limit
        }; 
        
        this.mongooseQuery = this.model.paginate(this.filterObject,this.paginationObject);
        return this;
    }
    sort(){
        const { sort } = this.query;
        if(sort){
            this.paginationObject.sort = sort;
            this.mongooseQuery = this.model.paginate(this.filterObject,this.paginationObject);
        }
        return this;
    }
    filters(){
        const { page = 1, limit = 2, sort , ...filters} = this.query;
        const stringFilter = JSON.stringify(filters);
        const repalcedFilter = stringFilter.replace(
            /lt|lte|gt|gte|regex/g,
            (matchedElement)=> `$${matchedElement}`);
        this.filterObject = JSON.parse(repalcedFilter);

        this.mongooseQuery = this.model.paginate(this.filterObject,this.paginationObject);
        return this;
    }
}

export class ApiFeatureWithFind {
    constructor(model, query) {
      this.model = model; // The Mongoose model instance
      this.query = query; // The request query parameters
      this.paginationObject = {}; // Pagination options
      this.filterObject = {}; // Filter options
      this.mongooseQuery = model; // Initialize mongooseQuery with the model
    }
  
    pagination() {
      const { page = 1, limit = 2 } = this.query;
      const skip = (page - 1) * limit;
      this.mongooseQuery = this.mongooseQuery.skip(skip).limit(+limit);
      return this;
    }
  
    sort() {
      const { sort } = this.query;
      if (sort) {
        this.mongooseQuery = this.mongooseQuery.sort(sort);
      }
      return this;
    }
  
    filters() {
      const { page, limit, sort, ...filters } = this.query;
      const stringFilter = JSON.stringify(filters);
      const replacedFilter = stringFilter.replace(
        /lt|lte|gt|gte|regex/g,
        (match) => `$${match}`
      );
      this.filterObject = JSON.parse(replacedFilter);
  
      this.mongooseQuery = this.mongooseQuery.find(this.filterObject);
      return this;
    }
  }
  