import React, { useState, useEffect} from "react";
import Pagination from "react-bootstrap/Pagination";

//pagination components 
const MyPagination = (props) => {
  const [pageArray, setPageArray] = useState([]);

  useEffect(() => {
    let totPages = parseInt(props.totPages);
    let currentPage = parseInt(props.currentPage);
    
    console.log(totPages)

    let pageArr = [];
    if (totPages > 1) {
      if (totPages <= 9) {
        for(let i=1; i<=totPages; i++) {
          pageArr.push(i);
        }
      } else {
        if (currentPage <= 5) pageArr = [1, 2, 3, 4, 5, 6, 7, 8, "", totPages];
        else if (totPages - currentPage <= 4)
          pageArr = [
            1,
            "",
            totPages - 7,
            totPages - 6,
            totPages - 5,
            totPages - 4,
            totPages - 3,
            totPages - 2,
            totPages - 1,
            totPages
          ];
        else
          pageArr = [
            1,
            "",
            currentPage - 3,
            currentPage - 2,
            currentPage - 1,
            currentPage,
            currentPage + 1,
            currentPage + 2,
            currentPage + 3,
            "",
            totPages
          ];
      }
    }
    setPageArray(pageArr);
  }, []);

  return (
    <React.Fragment>
      {props.children}
      <div style={{ marginTop: "15px" }}>
        <Pagination style={{ justifyContent: "center" }}>
          {pageArray.map((ele, index) => {
            const toReturn = [];
            if (index === 0) {
              toReturn.push(
                <Pagination.First
                  key={"firstpage"}
                  onClick={
                    props.currentPage === 1
                      ? () => {}
                      : () => { props.pageClicked(1); }
                  }
                />
              );
              toReturn.push(
                <Pagination.Prev
                  key={"prevpage"}
                  onClick={
                    props.currentPage === 1
                      ? () => {}
                      : () => { props.pageClicked(props.currentPage - 1); }
                  }
                />
              );
            }

            if (ele === "") toReturn.push(<Pagination.Ellipsis key={index} />);
            else
              toReturn.push(
                <Pagination.Item
                  key={index}
                  active={props.currentPage === ele ? true : false}
                  onClick={
                    props.currentPage === ele
                      ? () => {}
                      : () => { props.pageClicked(ele); }
                  }
                >
                  {ele}
                </Pagination.Item>
              );

            if (index === pageArray.length - 1) {
              toReturn.push(
                <Pagination.Next
                  key={"nextpage"}
                  onClick={
                    props.currentPage === ele
                      ? () => {}
                      : () => { props.pageClicked(props.currentPage + 1); }
                  }
                />
              );

              toReturn.push(
                <Pagination.Last
                  key={"lastpage"}
                  onClick={
                    props.currentPage === ele
                      ? () => {}
                      : () => {
                          props.pageClicked(ele);
                        }
                  }
                />
              );
            }
            return toReturn;
          })}
        </Pagination>
      </div>
    </React.Fragment>
  );
}

export default MyPagination;