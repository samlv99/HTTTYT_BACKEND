const mstime = require('mstime');
const { ITEMS_PER_PAGE } = require('./const');

const jsonClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// get url path only - remove query string (after "?"):
const getUrlPathOnly = (fullUrl) => {
  return `${fullUrl}?`.slice(0, fullUrl.indexOf('?'));
};

const endTimer = ({ key, req }) => {
  let timerKey = key;
  if (!key && req) {
    timerKey = getUrlPathOnly(req.originalUrl);
  }
  const end = mstime.end(timerKey);
  // console.log('- endTimer key: ', timerKey, end);
  if (end) {
    console.log(`- mstime: avg time - ${end.avg} (ms)`);
    // console.log('--- mstime: ', mstime);
    return end;
  }
  return null;
};

// from "sort" string (URL param) => build sort object (mongoose), e.g. "sort=name:desc,age"
const getSortQuery = (sortStr, defaultKey = 'createdAt') => {
  let arr = [sortStr || defaultKey];
  if (sortStr && sortStr.indexOf(',')) {
    arr = sortStr.split(',');
  }
  let ret = {};
  for (let i = 0; i < arr.length; i += 1) {
    let order = 1; // default: ascending (a-z)
    let keyName = arr[i].trim();
    if (keyName.indexOf(':') >= 0) {
      const [keyStr, orderStr] = keyName.split(':'); // e.g. "name:desc"
      keyName = keyStr.trim();
      order = orderStr.trim() === 'desc' || orderStr.trim() === '-1' ? -1 : 1;
    }
    ret = { ...ret, [keyName]: order };
  }
  return ret;
};

// from "req" (req.query) => transform to: query object, e.g. { limit: 5, sort: { name: 1 } }
const getPageQuery = (reqQuery) => {
  if (!reqQuery) {
    return null;
  }
  const output = {};
  if (reqQuery.page) {
    output.perPage = reqQuery.perPage || ITEMS_PER_PAGE; // if page is set => take (or set default) perPage
  }
  if (reqQuery.fields) {
    output.fields = reqQuery.fields.split(',').map((field) => field.trim()); // to array
  }
  // number (type) query params => parse them:
  const numParams = ['page', 'perPage', 'limit', 'offset'];
  numParams.forEach((field) => {
    if (reqQuery[field]) {
      output[field] = parseInt(reqQuery[field], 10);
    }
  });
  output.sort = getSortQuery(reqQuery.sort, 'createdAt');
  return output;
};

// normalize req.query to get "safe" query fields => return "query" obj for mongoose (find, etc.)
const getMongoQuery = (reqQuery, fieldArray) => {
  const queryObj = {};
  fieldArray.map((field) => {
    // get query fields excluding pagination fields:
    if (['page', 'perPage', 'limit', 'offset'].indexOf(field) < 0 && reqQuery[field]) {
      // TODO: do more checks of query parameters for better security...
      let val = reqQuery[field];
      if (typeof val === 'string' && val.length >= 2 && (val[0] === '*' || val[val.length - 1] === '*')) {
        // field value has "*text*" => use MongoDB Regex query: (partial text search)
        val = val.replace(/\*/g, ''); // remove "*"
        val = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape other special chars - https://goo.gl/eWCVDH
        queryObj[field] = { $regex: val, $options: 'i' };
      } else {
        queryObj[field] = reqQuery[field]; // exact search
      }
    }
  });
  console.log('- queryObj: ', JSON.stringify(queryObj));
  return queryObj;
};

/**
 * prepare a standard API Response, e.g. { meta: {...}, data: [...], errors: [...] }
 * @param param0
 */
const apiJson = async ({ req, res, data, model, meta = {}, json = false }) => {
  const queryObj = getPageQuery(req.query);
  const metaData = { ...queryObj, ...meta };

  if (model) {
    // if pass in "model" => query for totalCount & put in "meta"
    const isPagination = req.query.limit || req.query.page;
    if (isPagination && model.countDocuments) {
      const query = getMongoQuery(req.query, model.ALLOWED_FIELDS);
      const countQuery = jsonClone(query);
      const totalCount = await model.countDocuments(countQuery);
      metaData.totalCount = totalCount;
      if (queryObj.perPage) {
        metaData.pageCount = Math.ceil(totalCount / queryObj.perPage);
      }
      metaData.count = data && data.length ? data.length : 0;
    }
  }
  // add Timer data
  const timer = endTimer({ req });
  if (timer) {
    metaData.timer = timer.last;
    metaData.timerAvg = timer.avg;
  }

  const output = { data, meta: metaData };
  if (json) {
    return output;
  }
  return res.json(output);
};

const handleInputPaging = (params) => {
  params.pageIndex = Number(params.pageIndex) || 1;
  params.take = Number(params.take) || 10;
  params.skip = (params.pageIndex - 1) * params.take;
  params.sort = params.sort || 'asc';
  return params;
};

const handleOutputPaging = (data, totalItems, params) => {
  return {
    data,
    totalItems,
    pageIndex: params.pageIndex,
    totalPages: Math.ceil(totalItems / params.take),
  };
};

module.exports = {
  apiJson,
  handleInputPaging,
  handleOutputPaging,
};
