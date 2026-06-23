import React from 'react';
import ComplaintForm from '../components/ComplaintForm';

const CreateComplaint = () => {
  return (
    <div className="py-4">
      <ComplaintForm isEdit={false} />
    </div>
  );
};

export default CreateComplaint;
