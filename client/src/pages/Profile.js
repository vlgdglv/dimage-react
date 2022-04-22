import React from "react";

class Profile extends React.Component {

  constructor(props) {
    super(props)
  }
  
  render() {
    let id = this.props.match.params.userId;
      return (
      <div>
        <h1 style={{ paddingTop:"150px" }}>User Profile</h1>
        <h3>userId: { id }</h3>
      </div>
    )
  }  
}

// const Profile = () => {
//   const param = useParams();
//   return (
//     <div>
//       <h1 style={{ paddingTop:"150px" }}>User Profile</h1>
//       <h3>userId: { }</h3>
//     </div>
//   )
// }

export default Profile;