import { Avatar, List, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Contacts } from "../../Dummies"; // Pastikan path ini benar

// Terima prop 'onContactClick'
const ContactList = ({ onContactClick }) => {
  return (
    <List
      header={"Contacts"}
      dataSource={Contacts}
      renderItem={(item) => (
        // Tambahkan event onClick pada setiap List.Item
        <List.Item
          onClick={() => onContactClick(item)} // Panggil fungsi dari parent
          style={{ cursor: "pointer" }}
          className='contact-item' // Tambahkan class untuk efek hover
        >
          <List.Item.Meta
            avatar={
              <Badge dot color={item.online ? "green" : "gray"}>
                <Avatar icon={<UserOutlined />} src={item.avatar} />
              </Badge>
            }
            title={item.name}
          />
        </List.Item>
      )}
    />
  );
};

export default ContactList;
