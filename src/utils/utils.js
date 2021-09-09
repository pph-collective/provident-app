const sortByProperty = (property) => {
  return (a, b) => (a[property] > b[property] ? 1 : -1);
};

const today = () => {
  return new Date().toISOString().split("T")[0];
};

export default { sortByProperty, today };
