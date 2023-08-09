class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    //filter operators[gte, lte, gt, lt], option(sort, fields, limit, page)
    const options = ["sort", "fields", "limit", "page"];
    const queryOb = { ...this.queryStr };
    options.forEach((el) => delete queryOb[el]);

    let queryOperators = JSON.stringify(queryOb);
    queryOperators = queryOperators.replace(
      /\b(gte|lte|lt|gt)\b/g,
      (match) => `$${match}`,
    );
    console.log(JSON.parse(queryOperators));
    this.query = this.query.find(JSON.parse(queryOperators));

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const querySort = this.queryStr.sort.replace(",", " ");
      this.query = this.query.sort(querySort);
    } else this.query = this.query.sort("-createdAt");

    return this;
  }

  select() {
    if (this.queryStr.fields) {
      const fieldsStr = this.queryStr.fields.replace(",", " ");
      this.query = this.query.select(fieldsStr);
    } else this.query = this.query.select("-createdAt");

    return this;
  }

  pagination(count) {
    const page = +this.queryStr.page || 1;

    const limit = +this.queryStr.limit || 10;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(count / limit);
    if (page <= totalPages) this.query.skip(skip).limit(limit);
    else throw new Error("Page invalid");

    return this;
  }
}

module.exports = APIFeatures;
