const paginate = async (model, query = {}, reqQuery = {}, options = {}) => { // here model is our collection name jo bhi hum dynamically bhejenge and jo bhi hume additional query bhejna hai vo hum query param mai bhejenge. here options is for optional parameters
    const { page=1, limit=2, sort="-createdAt" } = reqQuery;

    const paginationOptions = {
        page : parseInt(page),
        limit : parseInt(limit),
        sort,
        ...options   // here ... is for rest operators that means jo bhi remaining values hai jo sabhi options name ke var mai aajaygi
    }

    try{
        const result = await model.paginate(query, paginationOptions) // here model is dynamical like category, news

        return {
            data: result.docs,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            currentPage: result.page,
            counter: result.pagingCounter,
            limit: result.limit,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages
        }

    }catch(error){
        console.log('Pagination Error', error.message);
    }
}

module.exports = paginate;