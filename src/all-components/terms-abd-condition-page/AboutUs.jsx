import React from "react";
import { Box, Typography, Container, Divider } from "@mui/material";
import { styled } from "@mui/system";

const AboutContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: "#f9f9f9",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: "#333",
  marginBottom: theme.spacing(3),
  textAlign: "center",
  position: "relative",
  "&:after": {
    content: '""',
    display: "block",
    width: "80px",
    height: "4px",
    background: "#1976d2",
    margin: "10px auto 0",
    borderRadius: "2px",
  },
}));

const AboutText = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem",
  lineHeight: 1.8,
  color: "#555",
  textAlign: "justify",
  marginBottom: theme.spacing(2),
}));

const Highlight = styled("span")({
  color: "#1976d2",
  fontWeight: 600,
});

const AboutUs = () => {
  return (
    <Box sx={{ py: 4 }}>
      <AboutContainer maxWidth="md">
        <Title variant="h4" gutterBottom>
          Mahira Collection সম্পর্কে
        </Title>

        <AboutText paragraph>
          <Highlight>Mahira Collection</Highlight> একটি বিশ্বস্ত অনলাইন প্ল্যাটফর্ম, যেখানে
          আপনি পাবেন সরাসরি চায়না থেকে আমদানি করা প্রিমিয়াম কোয়ালিটির প্রোডাক্ট।
          কোনোভাবেই লোকাল বা নিম্নমানের প্রোডাক্টের সাথে আপস করি না।
        </AboutText>

        <AboutText paragraph>
          গত <Highlight>চার বছর</Highlight> ধরে Mahira Collection সততা, মান এবং গ্রাহক
          সন্তুষ্টির ভিত্তিতে সফলভাবে আমাদের যাত্রা চালিয়ে যাচ্ছে। আমাদের প্রতিটি
          পণ্য যত্নসহকারে বাছাই করা, যাতে আপনি পান ট্রেন্ডি, স্টাইলিশ ও টেকসই
          ফ্যাশনের অভিজ্ঞতা।
        </AboutText>

        <AboutText paragraph>
          আমাদের কাছে রয়েছে দুই ধরনের অপশন — <Highlight>স্টক থাকা প্রোডাক্ট</Highlight> এবং{" "}
          <Highlight>প্রি-অর্ডার (pre-order)</Highlight> সুবিধা, যাতে আপনি আপনার
          পছন্দমতো কেনাকাটার সুযোগ পান।
        </AboutText>

        <AboutText paragraph>
          Mahira Collection-এ আমরা বিশ্বাস করি, কোয়ালিটি কোনো বিলাসিতা নয় — বরং
          এটা হওয়া উচিত প্রতিটি গ্রাহকের প্রাপ্য। তাই, আমাদের সঙ্গে থাকুন — এবং
          নিশ্চিত করুন সেরা মানের চায়নিজ কালেকশনের নির্ভরযোগ্য গন্তব্য।
        </AboutText>

        <Divider sx={{ my: 3 }} />

        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontStyle: "italic",
            color: "#666",
            fontWeight: 500,
          }}
        >
          ধন্যবাদ।
        </Typography>
      </AboutContainer>
    </Box>
  );
};

export default AboutUs;