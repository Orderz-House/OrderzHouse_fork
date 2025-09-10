import React, { useState, useEffect } from 'react';
import Loader from './loader/loader.jsx';

const withLoader = (WrappedComponent, fetchDataFunc) => {
  return (props) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const result = await fetchDataFunc(props);
          setData(result);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [props]);

    if (loading) return <Loader />;

    return <WrappedComponent {...props} data={data} />;
  };
};

export default withLoader;
